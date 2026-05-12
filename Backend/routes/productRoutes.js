import express from "express"
import { getProducts, createProduct, getProductById, updateProduct, deleteProduct } from "../controllers/productController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
const router = express.Router()

router.route("/")
  .get(protect, getProducts)
  .post(protect, authorize("admin", "manager"), createProduct)

router.route("/:id")
  .get(protect, getProductById)
  .put(protect, authorize("admin", "manager"), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct)

export default router
