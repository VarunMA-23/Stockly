import mongoose, { Schema } from "mongoose"

const saleItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const saleSchema = new Schema(
  {
    invoiceNo: { type: String, required: true, unique: true, trim: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", default: null },
    items: { type: [saleItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxPercent: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "wallet", "split"],
      required: true,
    },
    amountTendered: { type: Number, default: 0, min: 0 },
    changeAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["completed", "refunded", "partially_refunded"],
      default: "completed",
    },
    cashier: { type: Schema.Types.ObjectId, ref: "User", required: true },
    store: { type: Schema.Types.ObjectId, ref: "Store", default: null },
  },
  { timestamps: true }
)

saleSchema.index({ invoiceNo: 1 }, { unique: true })
saleSchema.index({ createdAt: -1 })

const Sale = mongoose.model("Sale", saleSchema)

export default Sale
