import DailyRecord from "../models/dailyRecordModel.js"
import { getSeason, getFestival, isWeekend, getDayName } from "../utils/festivalUtils.js"
import { fetchWeatherForDate } from "../services/weatherService.js"

const getDateKey = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export const updateDailyRecord = async (sale) => {
  const saleDate = new Date(sale.createdAt || new Date())
  const dateKey = getDateKey(saleDate)

  const [season, festival, weather] = await Promise.all([
    getSeason(saleDate),
    getFestival(saleDate),
    fetchWeatherForDate(saleDate),
  ])

  const dayName = getDayName(saleDate)
  const weekend = isWeekend(saleDate)

  const itemEntries = sale.items.map((item) => ({
    product: item.product?._id || item.product,
    productName: item.name,
    totalQuantity: item.quantity,
    totalRevenue: item.totalPrice,
  }))

  const paymentMethod = sale.paymentMethod || "cash"

  const record = await DailyRecord.findOne({ dateKey })

  if (record) {
    record.totalSales += 1
    record.totalRevenue += sale.total
    record.totalDiscount += sale.discountAmount || 0
    record.totalTax += sale.taxAmount || 0

    for (const newItem of itemEntries) {
      const existing = record.items.find((i) => i.productName === newItem.productName)
      if (existing) {
        existing.totalQuantity += newItem.totalQuantity
        existing.totalRevenue += newItem.totalRevenue
      } else {
        record.items.push(newItem)
      }
    }

    if (record.paymentBreakdown.has(paymentMethod)) {
      record.paymentBreakdown[paymentMethod] += 1
    }

    await record.save()
  } else {
    const paymentBreakdown = { cash: 0, card: 0, upi: 0, wallet: 0, split: 0 }
    paymentBreakdown[paymentMethod] = 1

    await DailyRecord.create({
      date: new Date(Date.UTC(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate())),
      dateKey,
      dayName,
      isWeekend: weekend,
      season,
      festival,
      weather,
      totalSales: 1,
      totalRevenue: sale.total,
      totalDiscount: sale.discountAmount || 0,
      totalTax: sale.taxAmount || 0,
      items: itemEntries,
      paymentBreakdown,
      store: sale.store || null,
    })
  }
}
