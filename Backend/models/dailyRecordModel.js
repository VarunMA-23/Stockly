import mongoose, { Schema } from "mongoose"

const dailyItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, required: true },
    category: { type: String, default: "Uncategorized" },
    totalQuantity: { type: Number, required: true, min: 0 },
    totalRevenue: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const dailyRecordSchema = new Schema(
  {
    date: { type: Date, required: true, unique: true },
    dateKey: { type: String, required: true, unique: true },
    dayName: { type: String, required: true },
    isWeekend: { type: Boolean, default: false },
    season: { type: String, default: "Unknown" },
    festival: { type: String, default: null },
    weather: {
      condition: { type: String, default: "Unknown" },
      temperature: { type: Number, default: 30 },
      feelsLike: { type: Number, default: 30 },
      humidity: { type: Number, default: 60 },
      windSpeed: { type: Number, default: 5 },
    },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0, min: 0 },
    totalDiscount: { type: Number, default: 0, min: 0 },
    totalTax: { type: Number, default: 0, min: 0 },
    items: { type: [dailyItemSchema], default: [] },
    paymentBreakdown: {
      cash: { type: Number, default: 0 },
      card: { type: Number, default: 0 },
      upi: { type: Number, default: 0 },
      wallet: { type: Number, default: 0 },
      split: { type: Number, default: 0 },
    },
    store: { type: Schema.Types.ObjectId, ref: "Store", default: null },
  },
  { timestamps: true }
)

dailyRecordSchema.index({ date: -1 })
dailyRecordSchema.index({ dateKey: 1 }, { unique: true })

const DailyRecord = mongoose.model("DailyRecord", dailyRecordSchema)

export default DailyRecord
