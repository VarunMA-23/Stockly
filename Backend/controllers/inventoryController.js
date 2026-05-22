import asyncHandler from "express-async-handler"
import InventoryLog from "../models/inventoryLogModel.js"
import Product from "../models/productModel.js"

// @desc    Get all inventory logs
// @route   GET /api/inventory/logs
// @access  Private
const getInventoryLogs = asyncHandler(async (req, res) => {
  const filter = {}

  if (req.query.product) {
    filter.product = req.query.product
  }

  if (req.query.type) {
    filter.type = req.query.type
  }

  if (req.query.dateFrom || req.query.dateTo) {
    filter.createdAt = {}
    if (req.query.dateFrom) {
      filter.createdAt.$gte = new Date(req.query.dateFrom)
    }
    if (req.query.dateTo) {
      filter.createdAt.$lte = new Date(req.query.dateTo)
    }
  }

  const logs = await InventoryLog.find(filter)
    .sort({ createdAt: -1 })
    .populate("product", "name sku quantity unit location image")
    .populate("performedBy", "name email role")

  res.json(logs)
})

// @desc    Get low stock products
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const lowStock = await Product.find({
    isActive: true,
    $expr: { $lte: ["$quantity", "$minStock"] },
  }).populate("category", "name")

  res.json(lowStock)
})

// @desc    Get products expiring soon
// @route   GET /api/inventory/expiring
// @access  Private
const getExpiringAlerts = asyncHandler(async (req, res) => {
  const daysThreshold = Number(req.query.days) || 30
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysThreshold)

  const expiringProducts = await Product.find({
    isActive: true,
    expiryDate: { $ne: null, $lte: futureDate },
  }).populate("category", "name")

  res.json(expiringProducts)
})

// @desc    Manually adjust product stock levels
// @route   POST /api/inventory/adjust
// @access  Private/Admin/Manager/Warehouse
const adjustInventory = asyncHandler(async (req, res) => {
  const { product: productId, quantity, type, notes } = req.body

  if (!productId || quantity === undefined) {
    res.status(400)
    throw new Error("Product and adjustment quantity are required")
  }

  const product = await Product.findById(productId)
  if (!product) {
    res.status(404)
    throw new Error("Product not found")
  }

  const adjustQty = Number(quantity)
  if (isNaN(adjustQty)) {
    res.status(400)
    throw new Error("Quantity must be a valid number")
  }

  if (product.quantity + adjustQty < 0) {
    res.status(400)
    throw new Error(`Insufficient stock. Current: ${product.quantity}, requested adjustment: ${adjustQty}`)
  }

  // Update stock
  product.quantity += adjustQty
  await product.save()

  // Create log
  const log = await InventoryLog.create({
    product: productId,
    type: type || "adjustment",
    quantity: adjustQty,
    reference: "manual",
    notes: notes || "Manual stock override",
    performedBy: req.user._id,
  })

  const populatedLog = await InventoryLog.findById(log._id)
    .populate("product", "name sku quantity unit")
    .populate("performedBy", "name email role")

  res.status(200).json({
    message: "Stock adjusted successfully",
    product,
    log: populatedLog,
  })
})

export {
  getInventoryLogs,
  getLowStockAlerts,
  getExpiringAlerts,
  adjustInventory,
}
