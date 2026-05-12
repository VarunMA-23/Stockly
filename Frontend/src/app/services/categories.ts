import api from "./api"
import type { Category } from "../types"

export const getCategories = async (params?: {
  isActive?: boolean
  parent?: string | null
}): Promise<Category[]> => {
  const queryParams: Record<string, string> = {}
  if (params?.isActive !== undefined) queryParams.isActive = String(params.isActive)
  if (params?.parent === "null") queryParams.parent = "null"
  const { data } = await api.get("/categories", { params: queryParams })
  return data
}

export const getCategoryById = async (id: string): Promise<Category> => {
  const { data } = await api.get(`/categories/${id}`)
  return data
}

export const createCategory = async (data_: {
  name: string
  description?: string
  parentCategory?: string | null
}): Promise<Category> => {
  const { data } = await api.post("/categories", data_)
  return data
}

export const updateCategory = async (
  id: string,
  data_: Partial<Pick<Category, "name" | "description" | "parentCategory" | "isActive">>
): Promise<Category> => {
  const { data } = await api.put(`/categories/${id}`, data_)
  return data
}

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`)
}
