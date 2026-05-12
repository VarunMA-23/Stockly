import express from "express"
import {
  createSale,
  getSaleById,
  getSaleByInvoiceNo,
  getSalePdf,
  getSales,
} from "../controllers/saleController.js"
import { authorize, protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/")
  .get(protect, getSales)
  .post(protect, authorize("admin", "manager", "cashier"), createSale)

router.route("/invoice/:invoiceNo")
  .get(protect, getSaleByInvoiceNo)

router.route("/pdf/:id")
  .get(protect, getSalePdf)

router.route("/:id")
  .get(protect, getSaleById)

export default router
