import express from "express"
import {
  getStores,
  createStore,
  getStoreById,
  updateStore,
  deleteStore,
} from "../controllers/storeController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

router
  .route("/")
  .get(protect, authorize("admin"), getStores)
  .post(protect, authorize("admin"), createStore)

router
  .route("/:id")
  .get(protect, getStoreById)
  .put(protect, authorize("admin"), updateStore)
  .delete(protect, authorize("admin"), deleteStore)

export default router
