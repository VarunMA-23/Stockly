import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Warehouse,
} from "lucide-react"
import {
  getInventoryLogs,
  getLowStockAlerts,
  getExpiringAlerts,
  adjustInventory,
} from "../services/inventory"
import { getProducts } from "../services/products"
import type { InventoryLog, Product } from "../types"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../components/ui/breadcrumb"
import { Input } from "../components/ui/input"
import { Skeleton } from "../components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"

type AdjustmentForm = {
  product: string
  quantity: string
  type: "adjustment" | "transfer" | "expiry" | "return"
  notes: string
}

const emptyForm: AdjustmentForm = {
  product: "",
  quantity: "",
  type: "adjustment",
  notes: "",
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message === "string"
  ) {
    return (error as { response?: { data?: { message?: string } } }).response!.data!
      .message as string
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function WarehouseManagement() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"adjust" | "logs" | "lowStock" | "expiry">("adjust")
  
  // Data lists
  const [products, setProducts] = useState<Product[]>([])
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [lowStock, setLowStock] = useState<Product[]>([])
  const [expiring, setExpiring] = useState<Product[]>([])

  // Loadings & Errors
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form State
  const [form, setForm] = useState<AdjustmentForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Filters
  const [logTypeFilter, setLogTypeFilter] = useState<string>("all")
  const [searchLogQuery, setSearchLogQuery] = useState("")

  const isWarehouseStaff = useMemo(() => {
    return ["admin", "manager", "warehouse"].includes(user?.role || "")
  }, [user])

  const fetchCatalogData = async () => {
    try {
      const response = await getProducts({ limit: 1000, isActive: true })
      setProducts(response.data)
    } catch (err) {
      console.error("Unable to load product selection list", err)
    }
  }

  const fetchTabContent = async () => {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === "logs") {
        const logsData = await getInventoryLogs()
        setLogs(logsData)
      } else if (activeTab === "lowStock") {
        const lowStockData = await getLowStockAlerts()
        setLowStock(lowStockData)
      } else if (activeTab === "expiry") {
        const expiringData = await getExpiringAlerts(30)
        setExpiring(expiringData)
      }
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load warehouse data"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCatalogData()
  }, [])

  useEffect(() => {
    fetchTabContent()
    setFormSuccess(null)
    setFormError(null)
  }, [activeTab])

  const stats = useMemo(() => {
    const alertCount = lowStock.length + expiring.length
    const uniqueLocations = new Set(
      products.map((p) => p.location?.trim()).filter(Boolean)
    )
    return {
      alerts: alertCount,
      logsCount: logs.length,
      locations: uniqueLocations.size,
    }
  }, [lowStock, expiring, logs, products])

  const handleAdjustSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.product || !form.quantity) {
      setFormError("Product and quantity adjustment delta are required")
      return
    }

    const qty = Number(form.quantity)
    if (isNaN(qty) || qty === 0) {
      setFormError("Adjustment quantity must be a non-zero integer")
      return
    }

    setSubmitting(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const response = await adjustInventory({
        product: form.product,
        quantity: qty,
        type: form.type,
        notes: form.notes.trim() || undefined,
      })

      setFormSuccess(
        `Success: Adjusted stock level for ${response.product.name} (Delta: ${qty > 0 ? "+" : ""}${qty}). New stock: ${response.product.quantity}.`
      )
      setForm(emptyForm)
      // Refresh current listing if appropriate
      fetchCatalogData()
    } catch (err) {
      setFormError(getErrorMessage(err, "Unable to register stock adjustment"))
    } finally {
      setSubmitting(false)
    }
  }

  const getLogTypeBadge = (type: InventoryLog["type"]) => {
    switch (type) {
      case "purchase":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
      case "sale":
        return "border-info/30 bg-info/10 text-info"
      case "transfer":
        return "border-amber-500/30 bg-amber-500/10 text-amber-500"
      case "adjustment":
        return "border-indigo-500/30 bg-indigo-500/10 text-indigo-500"
      case "expiry":
        return "border-destructive/30 bg-destructive/10 text-destructive"
      case "return":
        return "border-teal-500/30 bg-teal-500/10 text-teal-500"
      default:
        return "border-muted-foreground/30 bg-muted/10 text-muted-foreground"
    }
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesType = logTypeFilter === "all" || log.type === logTypeFilter
      const searchStr = `${log.product?.name || ""} ${log.product?.sku || ""} ${log.reference || ""} ${log.notes || ""}`.toLowerCase()
      const matchesSearch = searchStr.includes(searchLogQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [logs, logTypeFilter, searchLogQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Warehouse</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-bold">Warehouse Management</h1>
            <p className="mt-1 text-muted-foreground">
              Adjust stocks, monitor location shelves, verify expiring dates, and view historical movements.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => { fetchCatalogData(); fetchTabContent(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Mapped Shelf Locations</span>
            <span className="text-2xl font-bold">{stats.locations} active sections</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Attention Required</span>
            <span className="text-2xl font-bold">{stats.alerts} stock concerns</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Logged Movements</span>
            <span className="text-2xl font-bold">{stats.logsCount} operations</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "adjust"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("adjust")}
        >
          Stock Intake & Transfer
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "lowStock"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("lowStock")}
        >
          Low Stock Alerts
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "expiry"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("expiry")}
        >
          Expiry Checklist
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "logs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("logs")}
        >
          Stock Movements Log
        </button>
      </div>

      {/* Content panel */}
      {activeTab === "adjust" ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Intake/transfer card */}
          <div className="border border-border bg-card rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold">Manual Inventory Adjustment</h3>
              <p className="text-sm text-muted-foreground">
                Deduct damage/waste, return client goods, or transfer stock levels.
              </p>
            </div>

            {formError && (
              <div className="p-3 border border-destructive/25 bg-destructive/10 text-destructive text-sm rounded-lg">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 border border-success/25 bg-success/10 text-success text-sm rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{formSuccess}</span>
              </div>
            )}

            {isWarehouseStaff ? (
              <form onSubmit={handleAdjustSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Select Product *</label>
                  <Select
                    value={form.product}
                    onValueChange={(val) => setForm((prev) => ({ ...prev, product: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((prod) => (
                        <SelectItem key={prod._id} value={prod._id}>
                          {prod.name} ({prod.sku}) — Stock: {prod.quantity} {prod.unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Quantity Delta *</label>
                    <Input
                      type="number"
                      placeholder="e.g. +10 or -5"
                      value={form.quantity}
                      onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                    />
                    <span className="text-[10px] text-muted-foreground">Positive numbers increase stock, negative numbers decrease stock.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Adjustment Type</label>
                    <Select
                      value={form.type}
                      onValueChange={(val: any) => setForm((prev) => ({ ...prev, type: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Adjustment Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adjustment">Manual Adjustment</SelectItem>
                        <SelectItem value="transfer">Warehouse Transfer</SelectItem>
                        <SelectItem value="expiry">Waste / Expiry Write-off</SelectItem>
                        <SelectItem value="return">Customer Return</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Notes / Reason</label>
                  <Textarea
                    placeholder="Enter reason for stock level overrides..."
                    value={form.notes}
                    onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : "Record Stock Adjustment"}
                </Button>
              </form>
            ) : (
              <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 text-center">
                <AlertCircle className="mx-auto w-8 h-8 text-warning mb-2" />
                <h4 className="font-semibold text-warning">Restricted Access</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Requires Admin, Manager, or Warehouse staff permission to record manual stock adjustments.
                </p>
              </div>
            )}
          </div>

          {/* Quick tips planner */}
          <div className="border border-border bg-card rounded-xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold">Refill & Location Planning</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Verify shelf codes to save labor time when updating stock levels. Keep aisles clear and mark boxes with correct SKU codes.
              </p>

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Aisle Location Codes</span>
                    <span className="text-xs text-muted-foreground">Configure shelf locations inside the Product Form (e.g. &quot;Aisle 3 / Shelf A&quot;) to sort pick logs.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-sm border-t border-border pt-2">
                  <Calendar className="w-4 h-4 text-info shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Expiry Audit Controls</span>
                    <span className="text-xs text-muted-foreground">Check the Expiry Checklist tab to discard dairy, bread, and other perishable lots before they hit shelf displays.</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border text-center">
              <Warehouse className="mx-auto w-12 h-12 text-muted-foreground/35" />
            </div>
          </div>
        </div>
      ) : activeTab === "lowStock" ? (
        /* Low Stock Tab */
        <>
          {loading ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-muted-foreground">{error}</div>
          ) : lowStock.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="font-semibold text-lg text-foreground mb-1">Stock Health Excellent</h3>
              <p className="text-sm">No products are currently under minimum stock alerts.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Aisle Location</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Current Quantity</TableHead>
                    <TableHead>Alert Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((prod) => (
                    <TableRow key={prod._id}>
                      <TableCell className="font-mono text-xs">{prod.sku}</TableCell>
                      <TableCell className="font-medium">{prod.name}</TableCell>
                      <TableCell>
                        {typeof prod.category === "object" && prod.category
                          ? prod.category.name
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                          {prod.location || "Unassigned"}
                        </div>
                      </TableCell>
                      <TableCell>{prod.minStock}</TableCell>
                      <TableCell className="font-semibold text-destructive">
                        {prod.quantity} {prod.unit}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
                          {prod.quantity === 0 ? "Out of Stock" : "Low Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      ) : activeTab === "expiry" ? (
        /* Expiry Tab */
        <>
          {loading ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-muted-foreground">{error}</div>
          ) : expiring.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="font-semibold text-lg text-foreground mb-1">No Expiring Lots</h3>
              <p className="text-sm">No products are expiring within the next 30 days.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days Left</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiring.map((prod) => {
                    const daysLeft = prod.expiryDate
                      ? Math.ceil(
                          (new Date(prod.expiryDate).getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 0
                    return (
                      <TableRow key={prod._id}>
                        <TableCell className="font-mono text-xs">{prod.sku}</TableCell>
                        <TableCell className="font-medium">{prod.name}</TableCell>
                        <TableCell>
                          {typeof prod.category === "object" && prod.category
                            ? prod.category.name
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            {prod.location || "Unassigned"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {prod.quantity} {prod.unit}
                        </TableCell>
                        <TableCell>
                          {prod.expiryDate ? new Date(prod.expiryDate).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              daysLeft <= 7
                                ? "border-destructive/20 bg-destructive/10 text-destructive"
                                : "border-warning/20 bg-warning/10 text-warning"
                            }
                          >
                            {daysLeft <= 0 ? "Expired" : `${daysLeft} days`}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      ) : (
        /* Logs Tab */
        <>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchLogQuery}
                onChange={(event) => setSearchLogQuery(event.target.value)}
                placeholder="Search logs by SKU, name, invoice, PO..."
                className="pl-10"
              />
            </div>

            <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Movements</SelectItem>
                <SelectItem value="purchase">Intake (Purchase)</SelectItem>
                <SelectItem value="sale">Outflow (Sale)</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="adjustment">Manual Adjustment</SelectItem>
                <SelectItem value="expiry">Expiry Write-off</SelectItem>
                <SelectItem value="return">Customer Return</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-muted-foreground">{error}</div>
          ) : filteredLogs.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
              <FileText className="w-12 h-12 text-muted-foreground/35 mx-auto mb-3" />
              <h3 className="font-semibold text-lg text-foreground mb-1">No Movements Logged</h3>
              <p className="text-sm">There are no matching historical inventory log entries.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity Delta</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{log.product?.name || "Deleted Product"}</div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {log.product?.sku || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getLogTypeBadge(log.type)}>
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center font-bold text-sm ${
                            log.quantity > 0 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {log.quantity > 0 ? (
                            <ArrowUpRight className="w-4 h-4 mr-0.5 shrink-0" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 mr-0.5 shrink-0" />
                          )}
                          {log.quantity > 0 ? "+" : ""}
                          {log.quantity} {log.product?.unit || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{log.performedBy?.name || "System"}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {log.performedBy?.role || ""}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
