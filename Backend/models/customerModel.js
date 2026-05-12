import mongoose, { Schema } from "mongoose"

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true },
    address: { type: String, default: "" },
    gstin: { type: String, trim: true },
    loyaltyPoints: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    lastPurchaseDate: { type: Date },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
)

customerSchema.index({ mobile: 1 }, { unique: true })
customerSchema.index({ name: "text", mobile: "text", email: "text" })

const Customer = mongoose.model("Customer", customerSchema)

export default Customer
