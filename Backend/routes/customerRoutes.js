import express from "express"
import {
  createCustomer,
  getCustomerById,
  getCustomerPurchaseHistory,
  getCustomers,
  updateCustomer,
} from "../controllers/customerController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/")
  .get(protect, getCustomers)
  .post(protect, createCustomer)

router.route("/:id")
  .get(protect, getCustomerById)
  .put(protect, updateCustomer)

router.route("/:id/purchase-history")
  .get(protect, getCustomerPurchaseHistory)

export default router
