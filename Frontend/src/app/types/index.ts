export interface User {
  _id: string
  name: string
  email: string
  role: "admin" | "manager" | "cashier" | "warehouse" | "analyst"
  store?: string | Store
  isActive: boolean
}

export interface Store {
  _id: string
  name: string
  address?: string
  phone?: string
  gstin?: string
  isActive?: boolean
}

export interface Category {
  _id: string
  name: string
  description?: string
  parentCategory?: string | Category
  isActive: boolean
}

export interface Product {
  _id: string
  sku: string
  name: string
  category: string | Category
  description?: string
  buyingPrice: number
  sellingPrice: number
  mrp: number
  unit: "piece" | "kg" | "liter" | "pack" | "box"
  quantity: number
  minStock: number
  maxStock: number
  location?: string
  barcode?: string
  image?: string
  expiryDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Customer {
  _id: string
  name: string
  mobile: string
  email?: string
  address?: string
  gstin?: string
  loyaltyPoints: number
  totalPurchases: number
  lastPurchaseDate?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface SaleItem {
  product: string | Product
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Sale {
  _id: string
  invoiceNo: string
  customer?: string | Customer | null
  items: SaleItem[]
  subtotal: number
  discountPercent: number
  discountAmount: number
  taxPercent: number
  taxAmount: number
  total: number
  paymentMethod: "cash" | "upi" | "card" | "wallet" | "split"
  amountTendered: number
  changeAmount: number
  status: "completed" | "refunded" | "partially_refunded"
  cashier: string | User
  store?: string | Store | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pages: number
  total: number
}
