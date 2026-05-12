import api from "./api"
import type { Sale } from "../types"

type CreateSalePayload = {
  customer?: string
  items: Array<{
    product: string
    quantity: number
  }>
  discountPercent?: number
  taxPercent?: number
  paymentMethod: "cash" | "upi" | "card" | "wallet" | "split"
  amountTendered: number
}

export const getSales = async (params?: {
  cashier?: string
  dateFrom?: string
  dateTo?: string
}): Promise<Sale[]> => {
  const { data } = await api.get("/sales", { params })
  return data
}

export const createSale = async (payload: CreateSalePayload): Promise<Sale> => {
  const { data } = await api.post("/sales", payload)
  return data
}

export const getSaleById = async (id: string): Promise<Sale> => {
  const { data } = await api.get(`/sales/${id}`)
  return data
}

export const getSaleByInvoiceNo = async (invoiceNo: string): Promise<Sale> => {
  const { data } = await api.get(`/sales/invoice/${invoiceNo}`)
  return data
}

export const downloadSalePdf = async (id: string): Promise<Blob> => {
  const { data } = await api.get(`/sales/pdf/${id}`, { responseType: "blob" })
  return data
}
