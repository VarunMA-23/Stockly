import asyncHandler from "express-async-handler"
import Sale from "../models/saleModel.js"
import { buildSaleFromRequest } from "../services/billingService.js"
import { generateInvoicePdf } from "../services/pdfService.js"

const salePopulate = [
  { path: "customer", select: "name mobile email loyaltyPoints" },
  { path: "cashier", select: "name email role" },
  { path: "store", select: "name gstin address phone" },
  { path: "items.product", select: "sku name category" },
]

const createSale = asyncHandler(async (req, res) => {
  const {
    customer,
    items,
    discountPercent,
    taxPercent,
    paymentMethod,
    amountTendered,
  } = req.body

  if (!paymentMethod) {
    res.status(400)
    throw new Error("Payment method is required")
  }

  const sale = await buildSaleFromRequest({
    customerId: customer,
    items,
    discountPercent,
    taxPercent,
    paymentMethod,
    amountTendered,
    cashierId: req.user._id,
    storeId: req.user.store,
  })

  const populatedSale = await Sale.findById(sale._id)
    .populate(salePopulate)

  res.status(201).json(populatedSale)
})

const getSales = asyncHandler(async (req, res) => {
  const filter = {}

  if (req.query.cashier) {
    filter.cashier = req.query.cashier
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

  const sales = await Sale.find(filter)
    .sort({ createdAt: -1 })
    .populate("customer", "name mobile")
    .populate("cashier", "name")
    .populate("store", "name")

  res.json(sales)
})

const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate(salePopulate)
  if (!sale) {
    res.status(404)
    throw new Error("Sale not found")
  }
  res.json(sale)
})

const getSaleByInvoiceNo = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ invoiceNo: req.params.invoiceNo }).populate(
    salePopulate
  )
  if (!sale) {
    res.status(404)
    throw new Error("Sale not found")
  }
  res.json(sale)
})

const getSalePdf = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate(salePopulate)
  if (!sale) {
    res.status(404)
    throw new Error("Sale not found")
  }

  const pdfBuffer = generateInvoicePdf(sale)

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${sale.invoiceNo}.pdf"`
  )
  res.send(pdfBuffer)
})

export { createSale, getSales, getSaleById, getSaleByInvoiceNo, getSalePdf }
