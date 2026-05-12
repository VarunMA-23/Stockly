import mongoose, { Schema } from "mongoose"

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String },
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

categorySchema.index({ name: 1 }, { unique: true })

const Category = mongoose.model("Category", categorySchema)
export default Category
