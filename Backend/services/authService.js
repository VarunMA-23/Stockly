import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { jwt as jwtConfig } from "../config.js"

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, jwtConfig.secret, { expiresIn: jwtConfig.accessExpiry })
}

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, jwtConfig.secret, { expiresIn: jwtConfig.refreshExpiry })
}

export const verifyAccessToken = (token) => {
  return jwt.verify(token, jwtConfig.secret)
}

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtConfig.secret)
}

export const setRefreshCookie = (res, token) => {
  res.cookie("refreshJwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "Strict",
    path: "/api/users/refresh",
    maxAge: jwtConfig.cookieExpiry,
  })
}

export const clearRefreshCookie = (res) => {
  res.cookie("refreshJwt", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/api/users/refresh",
  })
}

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

export const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed)
}
