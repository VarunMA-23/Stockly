import Sale from "../models/saleModel.js"
import Product from "../models/productModel.js"
import Customer from "../models/customerModel.js"

const roundCurrency = (value) => Math.round(value * 100) / 100

export const generateInvoiceNumber = async (storeId) => {
  const now = new Date()
  const prefix = `${String(now.getFullYear()).slice(-2)}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`

  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const query = {
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  }

  if (storeId) {
    query.store = storeId
  }

  const count = await Sale.countDocuments(query)
  return `${prefix}-${String(count + 1).padStart(4, "0")}`
}

export const buildSaleFromRequest = async ({
  items,
  discountPercent = 0,
  taxPercent = 0,
  paymentMethod,
  amountTendered = 0,
  customerId,
  cashierId,
  storeId,
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one sale item is required")
  }

  const normalizedItems = []

  for (const item of items) {
    if (!item.product || !item.quantity) {
      throw new Error("Each sale item must include product and quantity")
    }

    const product = await Product.findById(item.product)
      .populate("category")
      .select("name sellingPrice quantity isActive sku")

    if (!product) {
      throw new Error("One or more products were not found")
    }

    if (!product.isActive) {
      throw new Error(`${product.name} is inactive and cannot be sold`)
    }

    if (product.quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`)
    }

    const unitPrice = roundCurrency(product.sellingPrice)
    const totalPrice = roundCurrency(unitPrice * Number(item.quantity))

    normalizedItems.push({
      product,
      quantity: Number(item.quantity),
      unitPrice,
      totalPrice,
      snapshot: {
        product: product._id,
        name: product.name,
        quantity: Number(item.quantity),
        unitPrice,
        totalPrice,
      },
    })
  }

  const subtotal = roundCurrency(
    normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0)
  )
  const discountAmount = roundCurrency(
    subtotal * (Number(discountPercent || 0) / 100)
  )
  const taxableBase = roundCurrency(subtotal - discountAmount)
  const taxAmount = roundCurrency(taxableBase * (Number(taxPercent || 0) / 100))
  const total = roundCurrency(taxableBase + taxAmount)

  if (Number(amountTendered || 0) < total) {
    throw new Error("Amount tendered must be greater than or equal to the total")
  }

  const invoiceNo = await generateInvoiceNumber(storeId)
  const sale = await Sale.create({
    invoiceNo,
    customer: customerId || null,
    items: normalizedItems.map((item) => item.snapshot),
    subtotal,
    discountPercent: Number(discountPercent || 0),
    discountAmount,
    taxPercent: Number(taxPercent || 0),
    taxAmount,
    total,
    paymentMethod,
    amountTendered: roundCurrency(Number(amountTendered || total)),
    changeAmount: roundCurrency(Number(amountTendered || total) - total),
    cashier: cashierId,
    store: storeId || null,
    status: "completed",
  })

  for (const item of normalizedItems) {
    item.product.quantity -= item.quantity
    await item.product.save()
  }

  if (customerId) {
    const customer = await Customer.findById(customerId)
    if (customer) {
      customer.totalPurchases = roundCurrency(customer.totalPurchases + total)
      customer.lastPurchaseDate = new Date()
      customer.loyaltyPoints += Math.floor(total / 10)
      await customer.save()
    }
  }

  return sale
}
