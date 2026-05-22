import api from "./api"
import type { PurchaseOrder } from "../types"

type POCreatePayload = {
  supplier: string
  items: {
    product: string
    quantity: number
    unitPrice: number
  }[]
  expectedDeliveryDate?: string
  notes?: string
  status?: string
}

type POUpdatePayload = Partial<POCreatePayload>

export const getPurchaseOrders = async (params?: {
  search?: string
  status?: string
  supplier?: string
}): Promise<PurchaseOrder[]> => {
  const { data } = await api.get("/purchase-orders", { params })
  return data
}

export const getPurchaseOrderById = async (id: string): Promise<PurchaseOrder> => {
  const { data } = await api.get(`/purchase-orders/${id}`)
  return data
}

export const createPurchaseOrder = async (
  payload: POCreatePayload
): Promise<PurchaseOrder> => {
  const { data } = await api.post("/purchase-orders", payload)
  return data
}

export const updatePurchaseOrder = async (
  id: string,
  payload: POUpdatePayload
): Promise<PurchaseOrder> => {
  const { data } = await api.put(`/purchase-orders/${id}`, payload)
  return data
}

export const approvePurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  const { data } = await api.patch(`/purchase-orders/${id}/approve`)
  return data
}

export const receivePurchaseOrder = async (
  id: string,
  items: { product: string; receivedQuantity: number }[]
): Promise<PurchaseOrder> => {
  const { data } = await api.patch(`/purchase-orders/${id}/receive`, { items })
  return data
}

export interface ReorderRecommendation {
  supplierId: string | null
  supplierName: string
  items: {
    product: {
      _id: string
      name: string
      sku: string
      quantity: number
      minStock: number
      maxStock: number
      buyingPrice: number
      unit: string
    }
    suggestedQuantity: number
    unitPrice: number
    totalPrice: number
  }[]
}

export const getRecommendations = async (): Promise<ReorderRecommendation[]> => {
  const { data } = await api.get("/purchase-orders/recommendations")
  return data
}
