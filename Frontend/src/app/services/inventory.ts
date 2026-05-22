import api from "./api"
import type { InventoryLog, Product } from "../types"

export const getInventoryLogs = async (params?: {
  product?: string
  type?: string
  dateFrom?: string
  dateTo?: string
}): Promise<InventoryLog[]> => {
  const { data } = await api.get("/inventory/logs", { params })
  return data
}

export const getLowStockAlerts = async (): Promise<Product[]> => {
  const { data } = await api.get("/inventory/low-stock")
  return data
}

export const getExpiringAlerts = async (days?: number): Promise<Product[]> => {
  const { data } = await api.get("/inventory/expiring", { params: { days } })
  return data
}

export const adjustInventory = async (payload: {
  product: string
  quantity: number
  type?: string
  notes?: string
}): Promise<{ message: string; product: Product; log: InventoryLog }> => {
  const { data } = await api.post("/inventory/adjust", payload)
  return data
}
