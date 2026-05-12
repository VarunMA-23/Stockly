import express from "express"
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshToken,
  getUserProfile,
  updateUserProfile,
  getUsers,
} from "../controllers/userController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(protect, logoutUser)
router.route("/refresh").post(refreshToken)
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile)
router.route("/").get(protect, authorize("admin"), getUsers)

export default router
