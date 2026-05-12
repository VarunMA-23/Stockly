import asyncHandler from "express-async-handler"
import Customer from "../models/customerModel.js"
import Sale from "../models/saleModel.js"

const getCustomers = asyncHandler(async (req, res) => {
  const filter = {}

  if (req.query.search) {
    const regex = new RegExp(req.query.search, "i")
    filter.$or = [{ name: regex }, { mobile: regex }, { email: regex }]
  }

  const customers = await Customer.find(filter).sort({ createdAt: -1 })
  res.json(customers)
})

const createCustomer = asyncHandler(async (req, res) => {
  const { name, mobile, email, address, gstin, tags } = req.body

  if (!name || !mobile) {
    res.status(400)
    throw new Error("Customer name and mobile are required")
  }

  const existingCustomer = await Customer.findOne({ mobile })
  if (existingCustomer) {
    res.status(400)
    throw new Error("Customer mobile already exists")
  }

  const customer = await Customer.create({
    name,
    mobile,
    email,
    address,
    gstin,
    tags: Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags.trim()
      ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [],
  })

  res.status(201).json(customer)
})

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
  if (!customer) {
    res.status(404)
    throw new Error("Customer not found")
  }

  const recentSales = await Sale.find({ customer: customer._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("invoiceNo total paymentMethod createdAt status")

  res.json({ ...customer.toObject(), recentSales })
})

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
  if (!customer) {
    res.status(404)
    throw new Error("Customer not found")
  }

  if (
    req.body.mobile &&
    req.body.mobile !== customer.mobile &&
    (await Customer.findOne({ mobile: req.body.mobile }))
  ) {
    res.status(400)
    throw new Error("Customer mobile already exists")
  }

  customer.name = req.body.name ?? customer.name
  customer.mobile = req.body.mobile ?? customer.mobile
  customer.email = req.body.email ?? customer.email
  customer.address = req.body.address ?? customer.address
  customer.gstin = req.body.gstin ?? customer.gstin

  if (req.body.tags !== undefined) {
    customer.tags = Array.isArray(req.body.tags)
      ? req.body.tags
      : typeof req.body.tags === "string"
      ? req.body.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : customer.tags
  }

  const updatedCustomer = await customer.save()
  res.json(updatedCustomer)
})

const getCustomerPurchaseHistory = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
  if (!customer) {
    res.status(404)
    throw new Error("Customer not found")
  }

  const sales = await Sale.find({ customer: customer._id })
    .sort({ createdAt: -1 })
    .populate("cashier", "name")
    .populate("store", "name")

  res.json(sales)
})

export {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  getCustomerPurchaseHistory,
}
