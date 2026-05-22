import express from "express"
import {
  getPurchaseOrders,
  createPurchaseOrder,
  getPurchaseOrderById,
  updatePurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder,
  getRecommendations,
} from "../controllers/purchaseOrderController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/")
  .get(protect, getPurchaseOrders)
  .post(protect, createPurchaseOrder)

router.route("/recommendations")
  .get(protect, getRecommendations)

router.route("/:id")
  .get(protect, getPurchaseOrderById)
  .put(protect, authorize("admin", "manager"), updatePurchaseOrder)

router.route("/:id/approve")
  .patch(protect, authorize("admin", "manager"), approvePurchaseOrder)

router.route("/:id/receive")
  .patch(protect, authorize("admin", "manager", "warehouse"), receivePurchaseOrder)

export default router
