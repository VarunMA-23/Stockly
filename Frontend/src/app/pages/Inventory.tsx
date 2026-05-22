import { useMemo } from "react"
import {
  AlertCircle,
  Grid3x3,
  List,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { useCategories } from "../hooks/useCategories"
import { useProducts } from "../hooks/useProducts"
import type { Product } from "../types"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../components/ui/breadcrumb"
import { Input } from "../components/ui/input"
import { Skeleton } from "../components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

import { formatCurrency } from "../utils/formatters"

type InventoryProps = {
  onNavigate: (path: string) => void
}

const formatDate = (value?: string) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString()
}

const getCategoryName = (category: Product["category"]) => {
  if (typeof category === "string") return category
  return category.name
}

export function Inventory({ onNavigate }: InventoryProps) {
  const {
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
    refetch,
  } = useProducts({ limit: 10, initialIsActive: true })
  const { categories } = useCategories()
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  const lowStockCount = useMemo(
    () => products.filter((product) => product.quantity > 0 && product.quantity <= product.minStock).length,
    [products]
  )

  const outOfStockCount = useMemo(
    () => products.filter((product) => product.quantity <= 0 || !product.isActive).length,
    [products]
  )

  const activeCategories = useMemo(
    () => categories.filter((categoryItem) => categoryItem.isActive),
    [categories]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_180px_auto]">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Inventory</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="mt-1 text-muted-foreground">
              Manage and track your product inventory.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <Button onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Inventory</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="mt-1 text-muted-foreground">
              Manage and track your product inventory.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => onNavigate("/inventory/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <List className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold">{outOfStockCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Grid3x3 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{categories.filter((category) => category.isActive).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_180px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name or SKU..."
            className="pl-10"
          />
        </div>

        <Select value={category || "all"} onValueChange={(value) => setCategory(value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {activeCategories.map((categoryItem) => (
              <SelectItem key={categoryItem._id} value={categoryItem._id}>
                {categoryItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={isActive === undefined ? "all" : isActive ? "active" : "inactive"}
          onValueChange={(value) => {
            if (value === "all") setIsActive(undefined)
            if (value === "active") setIsActive(true)
            if (value === "inactive") setIsActive(false)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="all">All statuses</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex bg-card border border-input rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${viewMode === "list" ? "bg-primary/10 text-primary" : ""}`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${viewMode === "grid" ? "bg-primary/10 text-primary" : ""}`}
            aria-label="Grid view"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <h3 className="mb-1 text-lg font-semibold">No products found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search || category || isActive === false
              ? "No products match your search or filters."
              : "Create your first product to start tracking inventory."}
          </p>
          <Button onClick={() => onNavigate("/inventory/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Buying Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.location || "No location set"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{getCategoryName(product.category)}</TableCell>
                    <TableCell className="font-semibold">
                      {product.quantity} {product.unit}
                    </TableCell>
                    <TableCell>{formatCurrency(product.buyingPrice)}</TableCell>
                    <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          product.isActive
                            ? "border-success/20 bg-success/10 text-success"
                            : "border-destructive/20 bg-destructive/10 text-destructive"
                        }
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(product.expiryDate)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => onNavigate(`/inventory/edit/${product._id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {pages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= pages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
