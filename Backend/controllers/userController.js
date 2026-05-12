import User from "../models/userModel.js"
import asyncHandler from "express-async-handler"
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  comparePassword,
  hashPassword,
} from "../utils/generateToken.js"

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, store } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error("User already Exists")
  }

  const user = await User.create({ name, email, password, store })

  if (user) {
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)
    user.refreshToken = await hashPassword(refreshToken)
    await user.save()

    setRefreshCookie(res, refreshToken)

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      store: user.store,
      accessToken,
    })
  } else {
    res.status(400)
    throw new Error("Invalid User Credentials")
  }
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)
    user.refreshToken = await hashPassword(refreshToken)
    await user.save()

    setRefreshCookie(res, refreshToken)

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      store: user.store,
      accessToken,
    })
  } else {
    res.status(401)
    throw new Error("Invalid email or password")
  }
})

const logoutUser = asyncHandler(async (req, res) => {
  clearRefreshCookie(res)

  if (req.user) {
    req.user.refreshToken = undefined
    await req.user.save()
  }

  res.status(200).json({ message: "Logged Out Successfully" })
})

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshJwt

  if (!token) {
    res.status(401)
    throw new Error("No refresh token")
  }

  try {
    const decoded = verifyRefreshToken(token)
    const user = await User.findById(decoded.userId)

    if (!user || !user.refreshToken) {
      res.status(401)
      throw new Error("Invalid refresh token")
    }

    const isValid = await comparePassword(token, user.refreshToken)
    if (!isValid) {
      res.status(401)
      throw new Error("Invalid refresh token")
    }

    const accessToken = generateAccessToken(user._id)

    res.json({ accessToken })
  } catch (error) {
    res.status(401)
    throw new Error("Invalid refresh token")
  }
})

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("store").select("-password")
  res.json(user)
})

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email

    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      store: updatedUser.store,
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password")
  res.json(users)
})

export { registerUser, loginUser, logoutUser, refreshToken, getUserProfile, updateUserProfile, getUsers }
