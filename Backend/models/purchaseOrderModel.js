import mongoose, { Schema } from "mongoose"

const poItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true }, // snapshot of product name
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  receivedQuantity: { type: Number, default: 0, min: 0 },
})

const purchaseOrderSchema = new Schema(
  {
    poNumber: { type: String, required: true, unique: true, index: true },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: [poItemSchema],
    status: {
      type: String,
      enum: ["draft", "pending_approval", "approved", "ordered", "received", "cancelled"],
      default: "draft",
    },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    expectedDeliveryDate: { type: Date },
    receivedDate: { type: Date },
    notes: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

purchaseOrderSchema.index({ poNumber: "text", notes: "text" })

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema)

export default PurchaseOrder
