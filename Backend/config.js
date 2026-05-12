import dotenv from "dotenv"

dotenv.config()

export const environment = process.env.NODE_ENV
export const port = process.env.PORT

export const db = {
  name: process.env.DB_NAME || "",
  host: process.env.DB_HOST || "",
  port: process.env.DB_PORT || "",
  user: process.env.DB_USER || "",
  password: process.env.DB_USER_PWD || "",
}

export const corsUrl = process.env.CORS_URL

export const jwt = {
  secret: process.env.JWT_SECRET || "fallback_dev_secret",
  accessExpiry: "15m",
  refreshExpiry: "7d",
  cookieExpiry: 7 * 24 * 60 * 60 * 1000,
}
