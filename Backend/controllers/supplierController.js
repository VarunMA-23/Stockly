import asyncHandler from "express-async-handler"
import Supplier from "../models/supplierModel.js"

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req, res) => {
  const filter = {}

  if (req.query.search) {
    const regex = new RegExp(req.query.search, "i")
    filter.$or = [
      { name: regex },
      { contactPerson: regex },
      { mobile: regex },
      { email: regex }
    ]
  }

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true"
  }

  const suppliers = await Supplier.find(filter).sort({ name: 1 })
  res.json(suppliers)
})

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private/Admin/Manager
const createSupplier = asyncHandler(async (req, res) => {
  const { name, contactPerson, mobile, email, address, gstin, performance } = req.body

  if (!name || !mobile) {
    res.status(400)
    throw new Error("Supplier name and mobile are required")
  }

  const existingSupplier = await Supplier.findOne({ mobile })
  if (existingSupplier) {
    res.status(400)
    throw new Error("Supplier with this mobile number already exists")
  }

  const supplier = await Supplier.create({
    name,
    contactPerson,
    mobile,
    email,
    address,
    gstin,
    performance: performance || {
      avgDeliveryDays: 0,
      qualityRating: 5,
      reliabilityScore: 100,
      onTimeDeliveryRate: 100
    }
  })

  res.status(201).json(supplier)
})

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)
  if (!supplier) {
    res.status(404)
    throw new Error("Supplier not found")
  }
  res.json(supplier)
})

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin/Manager
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)
  if (!supplier) {
    res.status(404)
    throw new Error("Supplier not found")
  }

  if (
    req.body.mobile &&
    req.body.mobile !== supplier.mobile &&
    (await Supplier.findOne({ mobile: req.body.mobile }))
  ) {
    res.status(400)
    throw new Error("Supplier with this mobile number already exists")
  }

  supplier.name = req.body.name ?? supplier.name
  supplier.contactPerson = req.body.contactPerson ?? supplier.contactPerson
  supplier.mobile = req.body.mobile ?? supplier.mobile
  supplier.email = req.body.email ?? supplier.email
  supplier.address = req.body.address ?? supplier.address
  supplier.gstin = req.body.gstin ?? supplier.gstin
  supplier.isActive = req.body.isActive ?? supplier.isActive

  if (req.body.performance) {
    supplier.performance = {
      ...supplier.performance,
      ...req.body.performance
    }
  }

  const updatedSupplier = await supplier.save()
  res.json(updatedSupplier)
})

// @desc    Deactivate supplier (soft delete)
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)
  if (!supplier) {
    res.status(404)
    throw new Error("Supplier not found")
  }

  supplier.isActive = false
  await supplier.save()
  res.json({ message: "Supplier deactivated" })
})

export {
  getSuppliers,
  createSupplier,
  getSupplierById,
  updateSupplier,
  deleteSupplier
}
