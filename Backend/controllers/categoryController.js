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
