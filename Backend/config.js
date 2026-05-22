import dotenv from "dotenv"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, ".env") })
dotenv.config({ path: resolve(__dirname, ".env.local") })

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

export const weather = {
  apiKey: process.env.WEATHER_API_KEY || "",
  city: process.env.WEATHER_CITY || "Delhi",
  countryCode: process.env.WEATHER_COUNTRY_CODE || "IN",
}

export const jwt = {
  secret: process.env.JWT_SECRET || "fallback_dev_secret",
  accessExpiry: "15m",
  refreshExpiry: "7d",
  cookieExpiry: 7 * 24 * 60 * 60 * 1000,
}
