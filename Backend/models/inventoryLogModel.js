import mongoose, { Schema } from "mongoose"

const inventoryLogSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
      type: String,
      enum: ["purchase", "sale", "transfer", "adjustment", "expiry", "return"],
      required: true,
    },
    quantity: { type: Number, required: true }, // positive = restock/inbound, negative = sale/outbound/damage
    reference: { type: String, default: "" }, // saleId, POId, or manual entry reference
    notes: { type: String, default: "" },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

inventoryLogSchema.index({ product: 1, createdAt: -1 })
inventoryLogSchema.index({ type: 1 })

const InventoryLog = mongoose.model("InventoryLog", inventoryLogSchema)

export default InventoryLog
