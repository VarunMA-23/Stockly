import express from "express"
import cors from "cors"
import "./database/index.js"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/userRoutes.js"
import { corsUrl, port } from "./config.js"
import todoRoutes from "./routes/todoRoutes.js"
import storeRoutes from "./routes/storeRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import customerRoutes from "./routes/customerRoutes.js"
import saleRoutes from "./routes/saleRoutes.js"
import supplierRoutes from "./routes/supplierRoutes.js"
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js"
import inventoryRoutes from "./routes/inventoryRoutes.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"
import { errorHandler } from "./middleware/errorMiddleware.js"


const PORT = port ?? 8080

export const app = express()

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`)
  next()
})

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true)
  },
  credentials: true,
  optionsSuccessStatus: 200
}))

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/users", userRoutes)
app.use("/api/todo", todoRoutes)
app.use("/api/stores", storeRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/products", productRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/sales", saleRoutes)
app.use("/api/suppliers", supplierRoutes)
app.use("/api/purchase-orders", purchaseOrderRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/analytics", analyticsRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
