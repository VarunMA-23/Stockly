import express from "express"
import {
  getSuppliers,
  createSupplier,
  getSupplierById,
  updateSupplier,
  deleteSupplier
} from "../controllers/supplierController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/")
  .get(protect, getSuppliers)
  .post(protect, authorize("admin", "manager"), createSupplier)

router.route("/:id")
  .get(protect, getSupplierById)
  .put(protect, authorize("admin", "manager"), updateSupplier)
  .delete(protect, authorize("admin"), deleteSupplier)

export default router
