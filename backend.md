Here is the complete, thorough breakdown of the Backend directory, with all Category-related files and their full contents.
---
Full Directory Tree Structure
Backend/
├── .env
├── .env.example
├── .gitignore
├── backend-live.log
├── config.js
├── package-lock.json
├── package.json
├── server.js
├── controllers/
│   ├── categoryController.js
│   ├── productController.js
│   ├── storeController.js
│   ├── todoController.js
│   └── userController.js
├── database/
│   └── index.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── categoryModel.js
│   ├── productModel.js
│   ├── storeModel.js
│   ├── todoModel.js
│   └── userModel.js
├── routes/
│   ├── categoryRoutes.js
│   ├── productRoutes.js
│   ├── storeRoutes.js
│   ├── todoRoutes.js
│   └── userRoutes.js
├── services/
│   └── authService.js
├── utils/
│   └── generateToken.js
└── node_modules/
---
1. CATEGORY MODEL -- models/categoryModel.js
Full path: C:\Users\91888\Desktop\Inventory Management system\Backend\models\categoryModel.js
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
Schema Fields Summary
Field	Type	Required
name	String	Yes
description	String	No
image	String	No
parentCategory	ObjectId (ref: "Category")	No
isActive	Boolean	No
timestamps	--	Yes (schema option)
Indexes
- { name: 1 } with { unique: true } -- enforces unique category names
---
2. CATEGORY CONTROLLER -- controllers/categoryController.js
Full path: C:\Users\91888\Desktop\Inventory Management system\Backend\controllers\categoryController.js
import asyncHandler from "express-async-handler"
import Category from "../models/categoryModel.js"
const getCategories = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.isActive !== undefined) { filter.isActive = req.query.isActive === "true" }
  if (req.query.parent === "null") { filter.parentCategory = null }
  const categories = await Category.find(filter)
  res.json(categories)
})
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parentCategory } = req.body
  if (!name) { res.status(400); throw new Error("Category name is required") }
  const exists = await Category.findOne({ name })
  if (exists) { res.status(400); throw new Error("Category name already exists") }
  const category = await Category.create({ name, description, image, parentCategory })
  res.status(201).json(category)
})
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) { res.status(404); throw new Error("Category not found") }
  res.json(category)
})
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) { res.status(404); throw new Error("Category not found") }
  category.name = req.body.name ?? category.name
  category.description = req.body.description ?? category.description
  category.image = req.body.image ?? category.image
  category.parentCategory = req.body.parentCategory ?? category.parentCategory
  category.isActive = req.body.isActive ?? category.isActive
  const updatedCategory = await category.save()
  res.json(updatedCategory)
})
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) { res.status(404); throw new Error("Category not found") }
  category.isActive = false
  await category.save()
  res.json({ message: "Category deactivated" })
})
export { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory }
Controller Logic Details
getCategories (GET all):
- Builds a dynamic filter object
- Supports query param ?isActive=true|false to filter by active status
- Supports query param ?parent=null to filter root-level categories (those with no parent)
- Returns array of Category documents
createCategory (POST):
- Requires name in body (400 if missing)
- Checks for duplicate name before creating (400 if exists)
- Accepts name, description, image, parentCategory in body
- Returns 201 with created category
getCategoryById (GET by ID):
- Fetches by req.params.id
- Returns 404 if not found
updateCategory (PUT by ID):
- Finds by ID, returns 404 if not found
- Uses nullish coalescing (??) for each field so only provided fields are updated
- Supports updating: name, description, image, parentCategory, isActive
- Saves and returns the updated document
deleteCategory (DELETE by ID):
- Soft-delete: sets isActive = false instead of removing the document
- Returns { message: "Category deactivated" }
- Returns 404 if not found
---
3. CATEGORY ROUTES -- routes/categoryRoutes.js
Full path: C:\Users\91888\Desktop\Inventory Management system\Backend\routes\categoryRoutes.js
import express from "express"
import { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory } from "../controllers/categoryController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
const router = express.Router()
router.route("/")
  .get(protect, getCategories)
  .post(protect, authorize("admin", "manager"), createCategory)
router.route("/:id")
  .get(protect, getCategoryById)
  .put(protect, authorize("admin", "manager"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory)
export default router
API Endpoints Summary
All routes are mounted at /api/categories (defined in server.js line 38).
Method	Endpoint	Auth Required	Role(s)
GET	/api/categories	Yes (protect)	Any authenticated user
POST	/api/categories	Yes (protect)	admin, manager
GET	/api/categories/:id	Yes (protect)	Any authenticated user
PUT	/api/categories/:id	Yes (protect)	admin, manager
DELETE	/api/categories/:id	Yes (protect)	admin
Auth Middleware Notes
- protect -- verifies JWT Bearer token from Authorization header, attaches req.user (from authMiddleware.js line 6-24)
- authorize("admin", "manager") -- checks that req.user.role is in the allowed roles list; returns 403 if not authorized (from authMiddleware.js line 26-34)
---
4. SUPPORTING FILES THAT REFERENCE CATEGORY
server.js (mount point)
Full path: C:\Users\91888\Desktop\Inventory Management system\Backend\server.js
Line 9 imports categoryRoutes, line 38 mounts them:
app.use("/api/categories", categoryRoutes)
models/productModel.js (Category as a foreign key)
Full path: C:\Users\91888\Desktop\Inventory Management system\Backend\models\productModel.js
Line 7: Products reference Category:
category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
controllers/productController.js (Category used in filtering and population)
Full path: C:\Users\91888\Desktop\Inventory Management system\Backend\controllers\productController.js
- Line 22: Filters products by category when req.query.category is present
- Line 28: populate("category") when fetching product list
- Line 48: populate("category") when fetching a single product by ID
---
5. REQUEST/RESPONSE FORMATS
GET /api/categories
Query params (optional):
- ?isActive=true or ?isActive=false
- ?parent=null (returns only top-level categories with no parent)
Response: Array of category objects:
[
  {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Electronics",
    "description": "Electronic items and gadgets",
    "image": "https://example.com/electronics.jpg",
    "parentCategory": null,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
POST /api/categories
Request body:
{
  "name": "Electronics",
  "description": "Electronic items",
  "image": "https://example.com/img.jpg",
  "parentCategory": "64a1b2c3d4e5f6a7b8c9d0e1"
}
Only name is required. Returns 201 on success.
Error responses:
- 400 -- missing name or duplicate name
- 401 -- not authenticated
- 403 -- insufficient role
GET /api/categories/:id
Response: Single category object (same shape as above).
Error: 404 if not found.
PUT /api/categories/:id
Request body (all optional):
{
  "name": "Updated Name",
  "description": "Updated description",
  "image": "https://example.com/new.jpg",
  "parentCategory": null,
  "isActive": false
}
Returns updated category object. 404 if not found, 400 if duplicate name conflict.
DELETE /api/categories/:id
Response: { "message": "Category deactivated" } (soft-delete by setting isActive = false).
Error: 404 if not found.
---
Summary of All Category-Related Files
#	File	Absolute Path
1	Category Model	C:\Users\91888\Desktop\Inventory Management system\Backend\models\categoryModel.js
2	Category Controller	C:\Users\91888\Desktop\Inventory Management system\Backend\controllers\categoryController.js
3	Category Routes	C:\Users\91888\Desktop\Inventory Management system\Backend\routes\categoryRoutes.js
4	Server (mount point)	C:\Users\91888\Desktop\Inventory Management system\Backend\server.js
5	Auth Middleware	C:\Users\91888\Desktop\Inventory Management system\Backend\middleware\authMiddleware.js
6	Product Model (references Category)	C:\Users\91888\Desktop\Inventory Management system\Backend\models\productModel.js
7	Product Controller (filters/populates Category)	C:\Users\91888\Desktop\Inventory Management system\Backend\controllers\productController.js
8	Database Config	C:\Users\91888\Desktop\Inventory Management system\Backend\database\index.js
9	App Config	C:\Users\91888\Desktop\Inventory Management system\Backend\config.js