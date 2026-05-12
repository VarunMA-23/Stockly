import mongoose, { Schema } from "mongoose"

const productSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, default: "" },
    buyingPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["piece", "kg", "liter", "pack", "box"], default: "piece" },
    quantity: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 5 },
    maxStock: { type: Number, default: 100 },
    location: { type: String },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier", default: null },
    barcode: { type: String, sparse: true },
    image: { type: String },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

productSchema.index({ sku: 1 }, { unique: true })
productSchema.index({ name: "text", description: "text" })

const Product = mongoose.model("Product", productSchema)
export default Product
