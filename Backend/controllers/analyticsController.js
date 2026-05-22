import asyncHandler from "express-async-handler"
import Sale from "../models/saleModel.js"
import Product from "../models/productModel.js"
import Supplier from "../models/supplierModel.js"
import PurchaseOrder from "../models/purchaseOrderModel.js"
import DailyRecord from "../models/dailyRecordModel.js"

const roundCurrency = (value) => Math.round(value * 100) / 100

// Helper to get day name
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// @desc    Get dashboard summary metrics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardMetrics = asyncHandler(async (req, res) => {
  // 1. Total active products count
  const totalProducts = await Product.countDocuments({ isActive: true })

  // 2. Low Stock Alerts count
  const lowStockAlerts = await Product.countDocuments({
    isActive: true,
    $expr: { $lte: ["$quantity", "$minStock"] },
  })

  // 3. Sales today
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const salesToday = await Sale.find({
    createdAt: { $gte: startOfToday, $lte: endOfToday },
    status: "completed",
  }).populate("items.product")

  let dailyRevenue = 0
  let dailyProfit = 0
  const ordersToday = salesToday.length

  for (const sale of salesToday) {
    dailyRevenue += sale.total
    let saleProfit = 0
    for (const item of sale.items) {
      const cost = (item.product?.buyingPrice || item.unitPrice * 0.6) * item.quantity
      saleProfit += (item.totalPrice - cost)
    }
    const discountFactor = 1 - (sale.discountPercent / 100)
    dailyProfit += saleProfit * discountFactor
  }

  // 4. Sales Growth (mocked comparison)
  // Let's do a basic comparison against yesterday
  const startOfYesterday = new Date()
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  startOfYesterday.setHours(0, 0, 0, 0)
  const endOfYesterday = new Date()
  endOfYesterday.setDate(endOfYesterday.getDate() - 1)
  endOfYesterday.setHours(23, 59, 59, 999)

  const salesYesterday = await Sale.find({
    createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
    status: "completed",
  })
  
  const yesterdayRevenue = salesYesterday.reduce((sum, s) => sum + s.total, 0)
  let salesGrowth = 0
  if (yesterdayRevenue > 0) {
    salesGrowth = roundCurrency(((dailyRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
  } else if (dailyRevenue > 0) {
    salesGrowth = 100 // 100% growth if yesterday was 0
  }

  // 5. Total inventory valuation (active products value)
  const allProducts = await Product.find({ isActive: true })
  const inventoryValue = allProducts.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0)

  // 6. Recent Alerts (Low stock products)
  const recentAlertProducts = await Product.find({
    isActive: true,
    $expr: { $lte: ["$quantity", "$minStock"] },
  })
    .limit(5)
    .populate("category")

  const alerts = recentAlertProducts.map((p) => ({
    product: p.name,
    status: p.quantity === 0 ? "Out of Stock" : "Low Stock",
    quantity: p.quantity,
    type: p.quantity === 0 ? "danger" : "warning",
  }))

  res.json({
    totalProducts,
    lowStockAlerts,
    dailyRevenue: roundCurrency(dailyRevenue),
    dailyProfit: roundCurrency(dailyProfit),
    ordersToday,
    salesGrowth,
    inventoryValue: roundCurrency(inventoryValue),
    alerts,
  })
})

// @desc    Get revenue and profit trend for last 7 days
// @route   GET /api/analytics/revenue
// @access  Private
const getRevenueReport = asyncHandler(async (asyncReq, res) => {
  const startOf7DaysAgo = new Date()
  startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6)
  startOf7DaysAgo.setHours(0, 0, 0, 0)

  const salesLast7Days = await Sale.find({
    createdAt: { $gte: startOf7DaysAgo },
    status: "completed",
  }).populate("items.product")

  const revenueMap = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const name = dayNames[d.getDay()]
    revenueMap[name] = { name, revenue: 0, profit: 0 }
  }

  for (const sale of salesLast7Days) {
    const dayName = dayNames[new Date(sale.createdAt).getDay()]
    if (revenueMap[dayName]) {
      revenueMap[dayName].revenue += sale.total
      let saleProfit = 0
      for (const item of sale.items) {
        const cost = (item.product?.buyingPrice || item.unitPrice * 0.6) * item.quantity
        saleProfit += (item.totalPrice - cost)
      }
      const discountFactor = 1 - (sale.discountPercent / 100)
      revenueMap[dayName].profit += saleProfit * discountFactor
    }
  }

  const revenueData = Object.values(revenueMap).map((d) => ({
    name: d.name,
    revenue: roundCurrency(d.revenue),
    profit: roundCurrency(d.profit),
  }))

  res.json(revenueData)
})

// @desc    Get sales distribution by category
// @route   GET /api/analytics/categories
// @access  Private
const getCategorySales = asyncHandler(async (asyncReq, res) => {
  const sales = await Sale.find({ status: "completed" }).populate({
    path: "items.product",
    populate: { path: "category" },
  })

  const categoryMap = {}
  let totalSalesValue = 0

  for (const sale of sales) {
    for (const item of sale.items) {
      const product = item.product
      let categoryName = "Others"
      if (product && product.category) {
        categoryName = typeof product.category === "object" ? product.category.name : "Others"
      }
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = 0
      }
      categoryMap[categoryName] += item.totalPrice
      totalSalesValue += item.totalPrice
    }
  }

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6", "#6b7280"]
  const categoryData = Object.entries(categoryMap).map(([name, value], index) => {
    const percentage = totalSalesValue > 0 ? Math.round((value / totalSalesValue) * 100) : 0
    return {
      name,
      value: percentage,
      amount: roundCurrency(value),
      color: colors[index % colors.length],
    }
  })

  res.json(categoryData)
})

// @desc    Get best-selling products
// @route   GET /api/analytics/best-selling
// @access  Private
const getBestSellingProducts = asyncHandler(async (asyncReq, res) => {
  const sales = await Sale.find({ status: "completed" }).populate("items.product")

  const productSalesMap = {}

  for (const sale of sales) {
    for (const item of sale.items) {
      const productId = item.product?._id?.toString() || item.name
      if (!productSalesMap[productId]) {
        productSalesMap[productId] = {
          name: item.name,
          sales: 0,
          revenue: 0,
          cost: 0,
        }
      }
      productSalesMap[productId].sales += item.quantity
      productSalesMap[productId].revenue += item.totalPrice
      const buyingPrice = item.product?.buyingPrice || item.unitPrice * 0.6
      productSalesMap[productId].cost += buyingPrice * item.quantity
    }
  }

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map((p) => {
      const profit = p.revenue - p.cost
      return {
        name: p.name,
        sales: p.sales,
        revenue: `₹${roundCurrency(p.revenue).toFixed(2)}`,
        profit: `₹${roundCurrency(profit).toFixed(2)}`,
        trend: "up",
        change: "+12%",
      }
    })

  res.json(topProducts)
})

// @desc    Get hourly sales activity
// @route   GET /api/analytics/peak-hours
// @access  Private
const getPeakHours = asyncHandler(async (asyncReq, res) => {
  const sales = await Sale.find({ status: "completed" })

  const hourMap = {}
  for (let i = 0; i < 24; i++) {
    hourMap[i] = { hour: `${i}:00`, sales: 0, revenue: 0 }
  }

  for (const sale of sales) {
    const hour = new Date(sale.createdAt).getHours()
    if (hourMap[hour]) {
      hourMap[hour].sales += 1
      hourMap[hour].revenue += sale.total
    }
  }

  const peakHoursData = Object.values(hourMap).map((d) => ({
    hour: d.hour,
    sales: d.sales,
    revenue: roundCurrency(d.revenue),
  }))

  res.json(peakHoursData)
})

// @desc    Get supplier performance summary
// @route   GET /api/analytics/supplier-performance
// @access  Private
const getSupplierPerformance = asyncHandler(async (asyncReq, res) => {
  const suppliers = await Supplier.find({ isActive: true })
  const orders = await PurchaseOrder.find()

  const supplierPerformanceData = suppliers.map((sup) => {
    const supOrders = orders.filter((o) => o.supplier?.toString() === sup._id.toString())
    const completedOrders = supOrders.filter((o) => o.status === "received")
    
    // Calculate stats
    const totalOrders = supOrders.length
    const receivedOrders = completedOrders.length
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0)
    
    return {
      name: sup.name,
      totalOrders,
      receivedOrders,
      totalSpent: roundCurrency(totalSpent),
      reliability: sup.performance?.reliabilityScore || 100,
      rating: sup.performance?.qualityRating || 5,
    }
  })

  res.json(supplierPerformanceData)
})

const escapeCsv = (value) => {
  const str = String(value ?? "")
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const getExportDataset = asyncHandler(async (req, res) => {
  const records = await DailyRecord.find().sort({ date: -1 }).lean()

  const headers = [
    "Date",
    "Day",
    "IsWeekend",
    "Season",
    "Festival",
    "WeatherCondition",
    "Temperature",
    "FeelsLike",
    "Humidity",
    "WindSpeed",
    "TotalSales",
    "TotalRevenue",
    "TotalDiscount",
    "TotalTax",
    "PaymentCash",
    "PaymentCard",
    "PaymentUPI",
    "PaymentWallet",
    "PaymentSplit",
  ]

  const allProductNames = new Set()
  for (const record of records) {
    for (const item of record.items) {
      allProductNames.add(item.productName)
    }
  }
  const sortedProducts = [...allProductNames].sort()
  const productHeaders = sortedProducts.map((name) => `Qty_${name.replace(/\s+/g, "_")}`)
  const revenueHeaders = sortedProducts.map((name) => `Rev_${name.replace(/\s+/g, "_")}`)
  const allHeaders = [...headers, ...productHeaders, ...revenueHeaders]

  let csv = allHeaders.join(",") + "\n"

  for (const record of records) {
    const date = new Date(record.date)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

    const row = {
      Date: dateStr,
      Day: record.dayName,
      IsWeekend: record.isWeekend ? "1" : "0",
      Season: record.season,
      Festival: record.festival || "None",
      WeatherCondition: record.weather?.condition || "Unknown",
      Temperature: String(record.weather?.temperature ?? ""),
      FeelsLike: String(record.weather?.feelsLike ?? ""),
      Humidity: String(record.weather?.humidity ?? ""),
      WindSpeed: String(record.weather?.windSpeed ?? ""),
      TotalSales: String(record.totalSales),
      TotalRevenue: String(record.totalRevenue),
      TotalDiscount: String(record.totalDiscount),
      TotalTax: String(record.totalTax),
      PaymentCash: String(record.paymentBreakdown?.cash ?? 0),
      PaymentCard: String(record.paymentBreakdown?.card ?? 0),
      PaymentUPI: String(record.paymentBreakdown?.upi ?? 0),
      PaymentWallet: String(record.paymentBreakdown?.wallet ?? 0),
      PaymentSplit: String(record.paymentBreakdown?.split ?? 0),
    }

    const itemMap = {}
    for (const item of record.items) {
      itemMap[item.productName] = { qty: item.totalQuantity, rev: item.totalRevenue }
    }

    const productValues = sortedProducts.map((name) => String(itemMap[name]?.qty ?? 0))
    const revenueValues = sortedProducts.map((name) => String(itemMap[name]?.rev ?? 0))

    const rowValues = allHeaders.map((h) => {
      if (row[h] !== undefined) return escapeCsv(row[h])
      const idx = productHeaders.indexOf(h)
      if (idx !== -1) return productValues[idx]
      const ridx = revenueHeaders.indexOf(h)
      if (ridx !== -1) return revenueValues[ridx]
      return ""
    })

    csv += rowValues.join(",") + "\n"
  }

  res.setHeader("Content-Type", "text/csv")
  res.setHeader("Content-Disposition", `attachment; filename="ml-dataset-${new Date().toISOString().split("T")[0]}.csv"`)
  res.send(csv)
})

export {
  getDashboardMetrics,
  getRevenueReport,
  getCategorySales,
  getBestSellingProducts,
  getPeakHours,
  getSupplierPerformance,
  getExportDataset,
}
