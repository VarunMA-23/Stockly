import api from "./api"
import type { Customer, Sale } from "../types"

type CustomerPayload = {
  name: string
  mobile: string
  email?: string
  address?: string
  gstin?: string
  tags?: string[] | string
}

export const getCustomers = async (search?: string): Promise<Customer[]> => {
  const { data } = await api.get("/customers", {
    params: search ? { search } : undefined,
  })
  return data
}

export const getCustomerById = async (
  id: string
): Promise<Customer & { recentSales?: Sale[] }> => {
  const { data } = await api.get(`/customers/${id}`)
  return data
}

export const createCustomer = async (
  payload: CustomerPayload
): Promise<Customer> => {
  const { data } = await api.post("/customers", payload)
  return data
}

export const updateCustomer = async (
  id: string,
  payload: Partial<CustomerPayload>
): Promise<Customer> => {
  const { data } = await api.put(`/customers/${id}`, payload)
  return data
}

export const getCustomerPurchaseHistory = async (id: string): Promise<Sale[]> => {
  const { data } = await api.get(`/customers/${id}/purchase-history`)
  return data
}
