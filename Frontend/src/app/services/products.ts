import api from "./api"
import type { PaginatedResponse, Product } from "../types"

type ProductQueryParams = {
  search?: string
  category?: string
  page?: number
  limit?: number
  minStock?: boolean
  isActive?: boolean
}

type ProductPayload = {
  sku?: string
  name: string
  category: string
  description?: string
  buyingPrice: number
  sellingPrice: number
  mrp: number
  unit?: Product["unit"]
  quantity?: number
  minStock?: number
  maxStock?: number
  location?: string
  barcode?: string
  image?: string
  expiryDate?: string
  isActive?: boolean
}

export const getProducts = async (
  params?: ProductQueryParams
): Promise<PaginatedResponse<Product>> => {
  const queryParams: Record<string, string | number> = {}

  if (params?.search) queryParams.search = params.search
  if (params?.category) queryParams.category = params.category
  if (params?.page) queryParams.page = params.page
  if (params?.limit) queryParams.limit = params.limit
  if (params?.minStock !== undefined) queryParams.minStock = String(params.minStock)
  if (params?.isActive !== undefined) queryParams.isActive = String(params.isActive)

  const { data } = await api.get("/products", { params: queryParams })

  return {
    data: data.products,
    page: data.page,
    pages: data.pages,
    total: data.total,
  }
}

export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export const createProduct = async (payload: ProductPayload): Promise<Product> => {
  const { data } = await api.post("/products", payload)
  return data
}

export const updateProduct = async (
  id: string,
  payload: Partial<ProductPayload>
): Promise<Product> => {
  const { data } = await api.put(`/products/${id}`, payload)
  return data
}

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`)
}
