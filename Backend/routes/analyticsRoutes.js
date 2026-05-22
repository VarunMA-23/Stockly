import express from "express"
import {
  getDashboardMetrics,
  getRevenueReport,
  getCategorySales,
  getBestSellingProducts,
  getPeakHours,
  getSupplierPerformance,
  getExportDataset,
} from "../controllers/analyticsController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/dashboard", protect, getDashboardMetrics)
router.get("/revenue", protect, authorize("admin", "manager", "analyst"), getRevenueReport)
router.get("/categories", protect, authorize("admin", "manager", "analyst"), getCategorySales)
router.get("/best-selling", protect, getBestSellingProducts)
router.get("/peak-hours", protect, authorize("admin", "manager", "analyst"), getPeakHours)
router.get("/supplier-performance", protect, authorize("admin", "manager", "analyst"), getSupplierPerformance)
router.get("/export-dataset", protect, authorize("admin", "manager"), getExportDataset)

export default router
