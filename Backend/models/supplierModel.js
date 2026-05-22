import mongoose, { Schema } from "mongoose"

const supplierSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true, default: "" },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    address: { type: String, default: "" },
    gstin: { type: String, trim: true },
    performance: {
      avgDeliveryDays: { type: Number, default: 0 },
      qualityRating: { type: Number, default: 5, min: 1, max: 5 },
      reliabilityScore: { type: Number, default: 100 },
      onTimeDeliveryRate: { type: Number, default: 100 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

supplierSchema.index({ mobile: 1 })
supplierSchema.index({ name: "text", contactPerson: "text", mobile: "text" })

const Supplier = mongoose.model("Supplier", supplierSchema)

export default Supplier
