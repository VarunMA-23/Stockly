import asyncHandler from "express-async-handler"
import PurchaseOrder from "../models/purchaseOrderModel.js"
import Product from "../models/productModel.js"
import Supplier from "../models/supplierModel.js"
import InventoryLog from "../models/inventoryLogModel.js"

const poPopulate = [
  { path: "supplier", select: "name contactPerson mobile email gstin" },
  { path: "createdBy", select: "name email role" },
  { path: "approvedBy", select: "name email role" },
  { path: "items.product", select: "sku name buyingPrice quantity unit" },
]

const roundCurrency = (value) => Math.round(value * 100) / 100

const generatePoNumber = async () => {
  const now = new Date()
  const prefix = `PO-${String(now.getFullYear()).slice(-2)}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`

  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const count = await PurchaseOrder.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  })
  return `${prefix}-${String(count + 1).padStart(4, "0")}`
}

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
const getPurchaseOrders = asyncHandler(async (req, res) => {
  const filter = {}

  if (req.query.status) {
    filter.status = req.query.status
  }

  if (req.query.supplier) {
    filter.supplier = req.query.supplier
  }

  if (req.query.search) {
    const regex = new RegExp(req.query.search, "i")
    filter.$or = [
      { poNumber: regex },
      { notes: regex }
    ]
  }

  const purchaseOrders = await PurchaseOrder.find(filter)
    .sort({ createdAt: -1 })
    .populate(poPopulate)

  res.json(purchaseOrders)
})

// @desc    Create a purchase order
// @route   POST /api/purchase-orders
// @access  Private/Admin/Manager
const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { supplier, items, expectedDeliveryDate, notes, status } = req.body

  if (!supplier || !Array.isArray(items) || items.length === 0) {
    res.status(400)
    throw new Error("Supplier and at least one item are required")
  }

  const supplierExists = await Supplier.findById(supplier)
  if (!supplierExists) {
    res.status(404)
    throw new Error("Supplier not found")
  }

  const normalizedItems = []
  let subtotal = 0

  for (const item of items) {
    if (!item.product || !item.quantity || item.unitPrice === undefined) {
      res.status(400)
      throw new Error("Each item must include product, quantity, and unitPrice")
    }

    const product = await Product.findById(item.product)
    if (!product) {
      res.status(404)
      throw new Error(`Product not found with id ${item.product}`)
    }

    const itemPrice = roundCurrency(Number(item.unitPrice))
    const itemTotalPrice = roundCurrency(itemPrice * Number(item.quantity))

    subtotal += itemTotalPrice

    normalizedItems.push({
      product: item.product,
      name: product.name,
      quantity: Number(item.quantity),
      unitPrice: itemPrice,
      totalPrice: itemTotalPrice,
      receivedQuantity: 0,
    })
  }

  const taxAmount = roundCurrency(subtotal * 0.1) // Standard 10% tax rate
  const total = roundCurrency(subtotal + taxAmount)

  const poNumber = await generatePoNumber()

  const purchaseOrder = await PurchaseOrder.create({
    poNumber,
    supplier,
    items: normalizedItems,
    status: status || "pending_approval",
    subtotal: roundCurrency(subtotal),
    taxAmount,
    total,
    expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
    notes: notes || "",
    createdBy: req.user._id,
  })

  const populatedPO = await PurchaseOrder.findById(purchaseOrder._id).populate(poPopulate)
  res.status(201).json(populatedPO)
})

// @desc    Get purchase order by ID
// @route   GET /api/purchase-orders/:id
// @access  Private
const getPurchaseOrderById = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id).populate(poPopulate)
  if (!purchaseOrder) {
    res.status(404)
    throw new Error("Purchase order not found")
  }
  res.json(purchaseOrder)
})

// @desc    Update purchase order
// @route   PUT /api/purchase-orders/:id
// @access  Private/Admin/Manager
const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id)
  if (!purchaseOrder) {
    res.status(404)
    throw new Error("Purchase order not found")
  }

  if (!["draft", "pending_approval"].includes(purchaseOrder.status)) {
    res.status(400)
    throw new Error("Only draft or pending approval orders can be modified")
  }

  const { supplier, items, expectedDeliveryDate, notes, status } = req.body

  if (supplier) {
    const supplierExists = await Supplier.findById(supplier)
    if (!supplierExists) {
      res.status(404)
      throw new Error("Supplier not found")
    }
    purchaseOrder.supplier = supplier
  }

  if (items && Array.isArray(items)) {
    if (items.length === 0) {
      res.status(400)
      throw new Error("At least one item is required")
    }

    const normalizedItems = []
    let subtotal = 0

    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product) {
        res.status(404)
        throw new Error(`Product not found with id ${item.product}`)
      }

      const itemPrice = roundCurrency(Number(item.unitPrice))
      const itemTotalPrice = roundCurrency(itemPrice * Number(item.quantity))

      subtotal += itemTotalPrice

      normalizedItems.push({
        product: item.product,
        name: product.name,
        quantity: Number(item.quantity),
        unitPrice: itemPrice,
        totalPrice: itemTotalPrice,
        receivedQuantity: item.receivedQuantity ?? 0,
      })
    }

    purchaseOrder.items = normalizedItems
    purchaseOrder.subtotal = roundCurrency(subtotal)
    purchaseOrder.taxAmount = roundCurrency(subtotal * 0.1)
    purchaseOrder.total = roundCurrency(purchaseOrder.subtotal + purchaseOrder.taxAmount)
  }

  purchaseOrder.notes = notes ?? purchaseOrder.notes
  purchaseOrder.status = status ?? purchaseOrder.status
  if (expectedDeliveryDate) {
    purchaseOrder.expectedDeliveryDate = new Date(expectedDeliveryDate)
  }

  const updatedPO = await purchaseOrder.save()
  const populatedPO = await PurchaseOrder.findById(updatedPO._id).populate(poPopulate)
  res.json(populatedPO)
})

// @desc    Approve purchase order
// @route   PATCH /api/purchase-orders/:id/approve
// @access  Private/Admin/Manager
const approvePurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id)
  if (!purchaseOrder) {
    res.status(404)
    throw new Error("Purchase order not found")
  }

  if (purchaseOrder.status !== "pending_approval" && purchaseOrder.status !== "draft") {
    res.status(400)
    throw new Error(`Cannot approve an order with status ${purchaseOrder.status}`)
  }

  purchaseOrder.status = "approved"
  purchaseOrder.approvedBy = req.user._id
  await purchaseOrder.save()

  const populatedPO = await PurchaseOrder.findById(purchaseOrder._id).populate(poPopulate)
  res.json(populatedPO)
})

// @desc    Receive purchase order items and add stock
// @route   PATCH /api/purchase-orders/:id/receive
// @access  Private/Admin/Manager/Warehouse
const receivePurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id)
  if (!purchaseOrder) {
    res.status(404)
    throw new Error("Purchase order not found")
  }

  if (!["approved", "ordered"].includes(purchaseOrder.status)) {
    res.status(400)
    throw new Error(`Cannot receive inventory for a purchase order that is ${purchaseOrder.status}`)
  }

  const { items } = req.body
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400)
    throw new Error("Items array with receipt quantities is required")
  }

  for (const receiptItem of items) {
    const item = purchaseOrder.items.find(
      (i) => i.product.toString() === receiptItem.product.toString()
    )

    if (!item) {
      res.status(400)
      throw new Error(`Product ${receiptItem.product} is not part of this purchase order`)
    }

    const additionalQty = Number(receiptItem.receivedQuantity) || 0
    if (additionalQty < 0) {
      res.status(400)
      throw new Error(`Received quantity cannot be negative for ${item.name}`)
    }

    // Increment received quantity on PO
    item.receivedQuantity += additionalQty

    // Add stock quantity to Product
    const product = await Product.findById(item.product)
    if (product) {
      product.quantity += additionalQty
      await product.save()

      await InventoryLog.create({
        product: product._id,
        type: "purchase",
        quantity: additionalQty,
        reference: purchaseOrder.poNumber,
        notes: `PO Inventory Intake - PO #${purchaseOrder.poNumber}`,
        performedBy: req.user._id,
      })
    }
  }

  // Check if all items are fully received
  const isFullyReceived = purchaseOrder.items.every(
    (item) => item.receivedQuantity >= item.quantity
  )

  purchaseOrder.status = isFullyReceived ? "received" : "ordered"
  if (isFullyReceived) {
    purchaseOrder.receivedDate = new Date()
  }

  await purchaseOrder.save()
  const populatedPO = await PurchaseOrder.findById(purchaseOrder._id).populate(poPopulate)
  res.json(populatedPO)
})

// @desc    Get auto-refill recommendations
// @route   GET /api/purchase-orders/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  // Find active products under their min stock limits
  const lowStockProducts = await Product.find({
    isActive: true,
    $expr: { $lte: ["$quantity", "$minStock"] },
  }).populate("supplier", "name contactPerson mobile email")

  // Group recommendations by supplier
  const recommendationsGrouped = {}

  for (const product of lowStockProducts) {
    const supplierId = product.supplier?._id?.toString() || "unknown"
    const supplierName = product.supplier?.name || "Unassigned Supplier"

    if (!recommendationsGrouped[supplierId]) {
      recommendationsGrouped[supplierId] = {
        supplierId: supplierId === "unknown" ? null : supplierId,
        supplierName,
        items: [],
      }
    }

    // Calculate suggested reorder quantity (target: maxStock - currentQuantity)
    const currentQty = product.quantity || 0
    const maxQty = product.maxStock || 100
    const suggestedQty = Math.max(maxQty - currentQty, product.minStock * 2)

    recommendationsGrouped[supplierId].items.push({
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        quantity: currentQty,
        minStock: product.minStock,
        maxStock: product.maxStock,
        buyingPrice: product.buyingPrice,
        unit: product.unit,
      },
      suggestedQuantity: suggestedQty,
      unitPrice: product.buyingPrice,
      totalPrice: roundCurrency(product.buyingPrice * suggestedQty),
    })
  }

  res.json(Object.values(recommendationsGrouped))
})

export {
  getPurchaseOrders,
  createPurchaseOrder,
  getPurchaseOrderById,
  updatePurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder,
  getRecommendations,
}
