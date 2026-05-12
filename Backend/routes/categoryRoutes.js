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
