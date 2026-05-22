import express from "express"
import {
  getInventoryLogs,
  getLowStockAlerts,
  getExpiringAlerts,
  adjustInventory,
} from "../controllers/inventoryController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/logs")
  .get(protect, getInventoryLogs)

router.route("/low-stock")
  .get(protect, getLowStockAlerts)

router.route("/expiring")
  .get(protect, getExpiringAlerts)

router.route("/adjust")
  .post(protect, authorize("admin", "manager", "warehouse"), adjustInventory)

export default router
