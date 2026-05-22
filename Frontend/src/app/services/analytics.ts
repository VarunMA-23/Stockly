import api from "./api"

export interface DashboardMetrics {
  totalProducts: number
  lowStockAlerts: number
  dailyRevenue: number
  dailyProfit: number
  ordersToday: number
  salesGrowth: number
  inventoryValue: number
  alerts: Array<{
    product: string
    status: string
    quantity: number
    type: "danger" | "warning" | "info"
  }>
}

export interface RevenueDataPoint {
  name: string
  revenue: number
  profit: number
}

export interface CategoryDataPoint {
  name: string
  value: number
  amount: number
  color: string
}

export interface TopProductDataPoint {
  name: string
  sales: number
  revenue: string
  profit: string
  trend: string
  change: string
}

export interface PeakHoursDataPoint {
  hour: string
  sales: number
  revenue: number
}

export interface SupplierPerformancePoint {
  name: string
  totalOrders: number
  receivedOrders: number
  totalSpent: number
  reliability: number
  rating: number
}

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const { data } = await api.get<DashboardMetrics>("/analytics/dashboard")
  return data
}

export const getRevenueReport = async (): Promise<RevenueDataPoint[]> => {
  const { data } = await api.get<RevenueDataPoint[]>("/analytics/revenue")
  return data
}

export const getCategorySales = async (): Promise<CategoryDataPoint[]> => {
  const { data } = await api.get<CategoryDataPoint[]>("/analytics/categories")
  return data
}

export const getBestSellingProducts = async (): Promise<TopProductDataPoint[]> => {
  const { data } = await api.get<TopProductDataPoint[]>("/analytics/best-selling")
  return data
}

export const getPeakHours = async (): Promise<PeakHoursDataPoint[]> => {
  const { data } = await api.get<PeakHoursDataPoint[]>("/analytics/peak-hours")
  return data
}

export const getSupplierPerformance = async (): Promise<SupplierPerformancePoint[]> => {
  const { data } = await api.get<SupplierPerformancePoint[]>("/analytics/supplier-performance")
  return data
}

export const downloadDatasetCsv = async (): Promise<Blob> => {
  const { data } = await api.get("/analytics/export-dataset", {
    responseType: "blob",
  })
  return data
}
