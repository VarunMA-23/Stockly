import asyncHandler from "express-async-handler"
import Product from "../models/productModel.js"

function generateSku() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `PRD-${result}`
}

const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const filter = {}

  if (req.query.search) {
    const regex = new RegExp(req.query.search, "i")
    filter.$or = [{ name: regex }, { sku: regex }, { barcode: regex }]
  }
  if (req.query.category) filter.category = req.query.category
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true"
  if (req.query.minStock) filter.$expr = { $lte: ["$quantity", "$minStock"] }

  const total = await Product.countDocuments(filter)
  const products = await Product.find(filter)
    .populate("category")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })

  res.json({ products, page, pages: Math.ceil(total / limit) || 1, total })
})

const createProduct = asyncHandler(async (req, res) => {
  const { sku: incomingSku } = req.body
  const sku = incomingSku || generateSku()

  const exists = await Product.findOne({ sku })
  if (exists) { res.status(400); throw new Error("SKU already exists") }

  const product = await Product.create({ ...req.body, sku })
  res.status(201).json(product)
})

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category")
  if (!product) { res.status(404); throw new Error("Product not found") }
  res.json(product)
})

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) { res.status(404); throw new Error("Product not found") }

  Object.assign(product, req.body)
  const updatedProduct = await product.save()
  res.json(updatedProduct)
})

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) { res.status(404); throw new Error("Product not found") }
  product.isActive = false
  await product.save()
  res.json({ message: "Product deactivated" })
})

export { getProducts, createProduct, getProductById, updateProduct, deleteProduct }
