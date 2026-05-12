import { useCallback, useEffect, useState } from "react"
import { getProducts } from "../services/products"
import type { Product } from "../types"

type UseProductsOptions = {
  limit?: number
  initialCategory?: string
  initialIsActive?: boolean
}

export function useProducts(options?: UseProductsOptions) {
  const limit = options?.limit ?? 10
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState(options?.initialCategory ?? "")
  const [isActive, setIsActive] = useState<boolean | undefined>(
    options?.initialIsActive
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [search])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getProducts({
        search: debouncedSearch || undefined,
        category: category || undefined,
        page,
        limit,
        isActive,
      })
      setProducts(response.data)
      setPage(response.page)
      setPages(response.pages)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }, [category, debouncedSearch, isActive, limit, page])

  useEffect(() => {
    setPage(1)
  }, [category, isActive])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    page,
    pages,
    total,
    search,
    setSearch,
    category,
    setCategory,
    isActive,
    setIsActive,
    setPage,
    refetch: fetchProducts,
  }
}
