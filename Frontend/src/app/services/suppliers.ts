import api from "./api"
import type { Supplier } from "../types"

type SupplierPayload = {
  name: string
  contactPerson?: string
  mobile: string
  email?: string
  address?: string
  gstin?: string
  performance?: {
    avgDeliveryDays?: number
    qualityRating?: number
    reliabilityScore?: number
    onTimeDeliveryRate?: number
  }
}

export const getSuppliers = async (
  search?: string,
  isActive?: boolean
): Promise<Supplier[]> => {
  const params: Record<string, any> = {}
  if (search) params.search = search
  if (isActive !== undefined) params.isActive = isActive

  const { data } = await api.get("/suppliers", { params })
  return data
}

export const getSupplierById = async (id: string): Promise<Supplier> => {
  const { data } = await api.get(`/suppliers/${id}`)
  return data
}

export const createSupplier = async (
  payload: SupplierPayload
): Promise<Supplier> => {
  const { data } = await api.post("/suppliers", payload)
  return data
}

export const updateSupplier = async (
  id: string,
  payload: Partial<SupplierPayload>
): Promise<Supplier> => {
  const { data } = await api.put(`/suppliers/${id}`, payload)
  return data
}

export const deleteSupplier = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/suppliers/${id}`)
  return data
}
