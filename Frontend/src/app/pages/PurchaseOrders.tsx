import { useEffect, useMemo, useState } from "react"
import {
  Plus,
  Search,
  FileText,
  RefreshCw,
  Truck,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  TrendingDown,
  ChevronRight,
  ShieldAlert,
} from "lucide-react"
import {
  getPurchaseOrders,
  createPurchaseOrder,
  getPurchaseOrderById,
  updatePurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder,
  getRecommendations,
  type ReorderRecommendation,
} from "../services/purchaseOrders"
import { getSuppliers } from "../services/suppliers"
import { getProducts } from "../services/products"
import type { PurchaseOrder, Supplier, Product, POItem } from "../types"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
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

type POFormItem = {
  product: string
  quantity: string
  unitPrice: string
}

type POForm = {
  supplier: string
  expectedDeliveryDate: string
  notes: string
  items: POFormItem[]
}

const emptyForm: POForm = {
  supplier: "",
  expectedDeliveryDate: "",
  notes: "",
  items: [{ product: "", quantity: "1", unitPrice: "0" }],
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

export function PurchaseOrders() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"orders" | "recommendations">("orders")
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([])
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Modals
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  
  // Form values
  const [form, setForm] = useState<POForm>(emptyForm)
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [receiving, setReceiving] = useState(false)
  const [approving, setApproving] = useState(false)

  const isAuthorizedToApprove = useMemo(() => {
    return user?.role === "admin" || user?.role === "manager"
  }, [user])

  const fetchOrders = async () => {
    setLoadingOrders(true)
    setError(null)
    try {
      const data = await getPurchaseOrders({
        search: search.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      setPurchaseOrders(data)
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load purchase orders"))
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchRecommendationsList = async () => {
    setLoadingRecommendations(true)
    try {
      const data = await getRecommendations()
      setRecommendations(data)
    } catch (err) {
      console.error("Unable to load recommendations:", err)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  // Load catalogs on mount
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [suppliersData, productsResponse] = await Promise.all([
          getSuppliers(undefined, true), // active only
          getProducts({ limit: 500, isActive: true }),
        ])
        setSuppliers(suppliersData)
        setProducts(productsResponse.data)
      } catch (err) {
        console.error("Unable to load selection catalogs:", err)
      }
    }
    loadCatalogs()
  }, [])

  useEffect(() => {
    if (activeTab === "orders") {
      const timeoutId = window.setTimeout(() => {
        fetchOrders()
      }, 300)
      return () => window.clearTimeout(timeoutId)
    } else {
      fetchRecommendationsList()
    }
  }, [search, statusFilter, activeTab])

  const calculatedTotals = useMemo(() => {
    let subtotal = 0
    form.items.forEach((item) => {
      const qty = Number(item.quantity) || 0
      const price = Number(item.unitPrice) || 0
      subtotal += qty * price
    })
    const tax = subtotal * 0.1
    const total = subtotal + tax
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    }
  }, [form.items])

  const handleOpenDetail = async (id: string) => {
    try {
      const data = await getPurchaseOrderById(id)
      setSelectedPO(data)
      // Pre-fill receiving quantities with ordered - received to be helpful
      const initialReceives: Record<string, string> = {}
      data.items.forEach((item) => {
        const remaining = Math.max(item.quantity - item.receivedQuantity, 0)
        initialReceives[item.product._id || (item.product as any)] = String(remaining)
      })
      setReceiveQuantities(initialReceives)
      setDetailDialogOpen(true)
    } catch (err) {
      alert(getErrorMessage(err, "Unable to load details"))
    }
  }

  const handleOpenCreate = () => {
    setForm(emptyForm)
    setSubmitError(null)
    setCreateDialogOpen(true)
  }

  const handleAddItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { product: "", quantity: "1", unitPrice: "0" }],
    }))
  }

  const handleRemoveItemRow = (index: number) => {
    if (form.items.length === 1) return
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const handleItemFieldChange = (index: number, field: keyof POFormItem, value: string) => {
    const newItems = [...form.items]
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    }

    // Auto-populate unitPrice if product is selected
    if (field === "product") {
      const selectedProd = products.find((p) => p._id === value)
      if (selectedProd) {
        newItems[index].unitPrice = String(selectedProd.buyingPrice)
      }
    }

    setForm((prev) => ({ ...prev, items: newItems }))
  }

  const handleCreatePOFromRecommendation = (reco: ReorderRecommendation) => {
    const formattedItems = reco.items.map((recoItem) => ({
      product: recoItem.product._id,
      quantity: String(recoItem.suggestedQuantity),
      unitPrice: String(recoItem.unitPrice),
    }))

    setForm({
      supplier: reco.supplierId || "",
      expectedDeliveryDate: "",
      notes: `Auto-generated from reorder suggestions.`,
      items: formattedItems.length > 0 ? formattedItems : [{ product: "", quantity: "1", unitPrice: "0" }],
    })
    
    setSubmitError(null)
    setActiveTab("orders")
    setCreateDialogOpen(true)
  }

  const handleSavePO = async () => {
    if (!form.supplier) {
      setSubmitError("Supplier selection is required")
      return
    }

    const invalidItem = form.items.some((item) => !item.product || Number(item.quantity) <= 0)
    if (invalidItem) {
      setSubmitError("Ensure all rows have a product selected and quantity is greater than 0")
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      supplier: form.supplier,
      notes: form.notes.trim() || undefined,
      expectedDeliveryDate: form.expectedDeliveryDate || undefined,
      items: form.items.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      status: "pending_approval",
    }

    try {
      await createPurchaseOrder(payload)
      setCreateDialogOpen(false)
      fetchOrders()
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Unable to create purchase order"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprovePO = async () => {
    if (!selectedPO) return
    setApproving(true)
    try {
      const updated = await approvePurchaseOrder(selectedPO._id)
      setSelectedPO(updated)
      fetchOrders()
    } catch (err) {
      alert(getErrorMessage(err, "Unable to approve order"))
    } finally {
      setApproving(false)
    }
  }

  const handleReceivePO = async () => {
    if (!selectedPO) return
    setReceiving(true)
    try {
      const itemsPayload = Object.entries(receiveQuantities)
        .map(([productId, qty]) => ({
          product: productId,
          receivedQuantity: Number(qty) || 0,
        }))
        .filter((item) => item.receivedQuantity > 0)

      if (itemsPayload.length === 0) {
        alert("Please enter a valid quantity received for at least one item.")
        setReceiving(false)
        return
      }

      const updated = await receivePurchaseOrder(selectedPO._id, itemsPayload)
      setSelectedPO(updated)
      // Reset receipt values
      const nextReceives: Record<string, string> = {}
      updated.items.forEach((item) => {
        const remaining = Math.max(item.quantity - item.receivedQuantity, 0)
        nextReceives[item.product._id || (item.product as any)] = String(remaining)
      })
      setReceiveQuantities(nextReceives)
      fetchOrders()
    } catch (err) {
      alert(getErrorMessage(err, "Unable to save receipt details"))
    } finally {
      setReceiving(false)
    }
  }

  const handleReceiveAllPO = async () => {
    if (!selectedPO) return
    if (!window.confirm("Mark all items in this order as fully received? Product stocks will be updated.")) return
    setReceiving(true)
    try {
      const itemsPayload = selectedPO.items.map((item) => {
        const remaining = Math.max(item.quantity - item.receivedQuantity, 0)
        return {
          product: item.product._id || (item.product as any),
          receivedQuantity: remaining,
        }
      })

      const updated = await receivePurchaseOrder(selectedPO._id, itemsPayload)
      setSelectedPO(updated)
      setDetailDialogOpen(false)
      fetchOrders()
    } catch (err) {
      alert(getErrorMessage(err, "Unable to receive all products"))
    } finally {
      setReceiving(false)
    }
  }

  const getStatusBadgeClass = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "draft":
        return "border-muted-foreground/30 bg-muted/10 text-muted-foreground"
      case "pending_approval":
        return "border-warning/35 bg-warning/10 text-warning"
      case "approved":
        return "border-primary/35 bg-primary/10 text-primary"
      case "ordered":
        return "border-info/35 bg-info/10 text-info"
      case "received":
        return "border-success/35 bg-success/10 text-success"
      case "cancelled":
        return "border-destructive/35 bg-destructive/10 text-destructive"
      default:
        return ""
    }
  }

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "pending_approval", label: "Pending Approval" },
    { value: "approved", label: "Approved" },
    { value: "ordered", label: "Ordered" },
    { value: "received", label: "Received" },
    { value: "cancelled", label: "Cancelled" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Purchase Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-bold">Purchase Orders</h1>
            <p className="mt-1 text-muted-foreground">
              Draft procurement orders, authorize budgets, and log inbound product shipments.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => activeTab === "orders" ? fetchOrders() : fetchRecommendationsList()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create PO
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "orders"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Order Logs
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "recommendations"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("recommendations")}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          Auto-Refill Suggestions
        </button>
      </div>

      {activeTab === "orders" ? (
        <>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by PO Number..."
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingOrders ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : purchaseOrders.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <div className="mb-4 flex justify-center">
                <FileText className="h-12 w-12 text-muted-foreground/40" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">No purchase orders found</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "Adjust search keyword or filter options."
                  : "Begin procurement by creating a new purchase order."}
              </p>
              <Button onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create PO
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items Count</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => {
                    const supName =
                      typeof po.supplier === "object" && po.supplier
                        ? po.supplier.name
                        : "Unassigned Supplier"
                    return (
                      <TableRow key={po._id}>
                        <TableCell className="font-semibold font-mono">
                          {po.poNumber}
                        </TableCell>
                        <TableCell>{supName}</TableCell>
                        <TableCell>{po.items.length} unique items</TableCell>
                        <TableCell className="font-medium">
                          ${po.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {po.expectedDeliveryDate
                            ? new Date(po.expectedDeliveryDate).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeClass(po.status)}>
                            {po.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(po._id)}>
                            Details
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
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
        /* Recommendations Tab */
        <>
          {loadingRecommendations ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">Analyzing stock thresholds...</span>
              </div>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <div className="mb-4 flex justify-center text-success">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">Inventory Levels Healthy</h3>
              <p className="text-sm text-muted-foreground">
                No active products are currently below their minimum stock thresholds.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-primary/5 to-info/5 border border-primary/20 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Reorder Analysis Complete</h4>
                  <p className="text-xs text-muted-foreground">
                    We found {recommendations.reduce((sum, r) => sum + r.items.length, 0)} items that require restocking. Grouped below by supplier.
                  </p>
                </div>
              </div>

              <div className="grid gap-6">
                {recommendations.map((reco, idx) => (
                  <div
                    key={reco.supplierId || idx}
                    className="border border-border bg-card rounded-xl overflow-hidden"
                  >
                    <div className="p-4 bg-secondary/20 border-b border-border flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{reco.supplierName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {reco.items.length} recommended items
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Est. Total Cost</p>
                          <p className="font-bold text-primary">
                            ${reco.items.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCreatePOFromRecommendation(reco)}
                        >
                          Generate PO
                        </Button>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Current Qty</TableHead>
                          <TableHead>Min Stock</TableHead>
                          <TableHead>Recommended Order</TableHead>
                          <TableHead>Cost Price</TableHead>
                          <TableHead>Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reco.items.map((recoItem) => (
                          <TableRow key={recoItem.product._id}>
                            <TableCell className="font-mono text-xs">{recoItem.product.sku}</TableCell>
                            <TableCell className="font-medium">{recoItem.product.name}</TableCell>
                            <TableCell className="text-destructive font-semibold">
                              {recoItem.product.quantity} {recoItem.product.unit}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {recoItem.product.minStock}
                            </TableCell>
                            <TableCell className="font-bold text-primary">
                              +{recoItem.suggestedQuantity}
                            </TableCell>
                            <TableCell>${recoItem.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="font-medium">
                              ${recoItem.totalPrice.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE PO DIALOG */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl lg:max-w-3xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Select a supplier and compile items to request new inventory stock.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {submitError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Select Supplier *</label>
                <Select
                  value={form.supplier}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, supplier: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((sup) => (
                      <SelectItem key={sup._id} value={sup._id}>
                        {sup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Expected Delivery Date</label>
                <Input
                  type="date"
                  value={form.expectedDeliveryDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, expectedDeliveryDate: event.target.value }))}
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Purchase Items</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItemRow}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Row
                </Button>
              </div>

              <div className="space-y-2">
                {form.items.map((row, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 min-w-[200px] space-y-0.5">
                      {index === 0 && <label className="text-xs font-semibold text-muted-foreground">Product *</label>}
                      <Select
                        value={row.product}
                        onValueChange={(val) => handleItemFieldChange(index, "product", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((prod) => (
                            <SelectItem key={prod._id} value={prod._id}>
                              {prod.name} ({prod.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-24 space-y-0.5">
                      {index === 0 && <label className="text-xs font-semibold text-muted-foreground">Quantity *</label>}
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={row.quantity}
                        onChange={(event) => handleItemFieldChange(index, "quantity", event.target.value)}
                      />
                    </div>

                    <div className="w-32 space-y-0.5">
                      {index === 0 && <label className="text-xs font-semibold text-muted-foreground">Buying Price ($)</label>}
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Cost"
                        value={row.unitPrice}
                        onChange={(event) => handleItemFieldChange(index, "unitPrice", event.target.value)}
                      />
                    </div>

                    <div className="w-24 text-right pr-2 pb-2">
                      {index === 0 && <div className="text-xs font-semibold text-muted-foreground mb-1">Subtotal</div>}
                      <span className="text-sm font-medium">
                        ${((Number(row.quantity) || 0) * (Number(row.unitPrice) || 0)).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive mb-0.5"
                      onClick={() => handleRemoveItemRow(index)}
                      disabled={form.items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4 grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Notes / Comments</label>
                <Textarea
                  placeholder="Incorporate optional vendor communication or terms here..."
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </div>

              <div className="space-y-1.5 text-sm bg-secondary/30 p-3 rounded-lg flex flex-col justify-center">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${calculatedTotals.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (10%):</span>
                  <span>${calculatedTotals.tax}</span>
                </div>
                <div className="border-t border-border my-1 pt-1 flex justify-between font-bold text-primary">
                  <span>Total:</span>
                  <span>${calculatedTotals.total}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePO} disabled={submitting}>
              {submitting ? "Saving..." : "Submit for Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAIL & STATUS ACTIONS DIALOG */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl lg:max-w-3xl overflow-y-auto max-h-[85vh]">
          {selectedPO && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <DialogTitle className="font-mono text-xl">{selectedPO.poNumber}</DialogTitle>
                  <Badge variant="outline" className={getStatusBadgeClass(selectedPO.status)}>
                    {selectedPO.status.replace("_", " ")}
                  </Badge>
                </div>
                <DialogDescription>
                  Detailed log of procurement request and shipping checklist.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3 bg-secondary/20 p-4 rounded-xl text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Supplier</span>
                    <span className="font-semibold">
                      {typeof selectedPO.supplier === "object" && selectedPO.supplier
                        ? selectedPO.supplier.name
                        : "Unassigned Supplier"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Expected Delivery</span>
                    <span>
                      {selectedPO.expectedDeliveryDate
                        ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString()
                        : "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Authorized By</span>
                    <span>
                      {selectedPO.approvedBy
                        ? (selectedPO.approvedBy as any).name
                        : "Pending Approval"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">PO Items Checklist</h4>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Ordered</TableHead>
                          <TableHead>Cost Price</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead>Received</TableHead>
                          {["approved", "ordered"].includes(selectedPO.status) && (
                            <TableHead className="w-28">Intake Qty</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPO.items.map((item) => {
                          const prodId = item.product._id || (item.product as any)
                          return (
                            <TableRow key={item._id || prodId}>
                              <TableCell>
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-xs font-mono text-muted-foreground">
                                  {typeof item.product === "object" && item.product
                                    ? item.product.sku
                                    : ""}
                                </div>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                              <TableCell>${item.totalPrice.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5 font-medium">
                                  {item.receivedQuantity >= item.quantity ? (
                                    <CheckCircle2 className="w-4 h-4 text-success" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-warning" />
                                  )}
                                  {item.receivedQuantity} / {item.quantity}
                                </div>
                              </TableCell>
                              {["approved", "ordered"].includes(selectedPO.status) && (
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={String(item.quantity - item.receivedQuantity)}
                                    value={receiveQuantities[prodId] || "0"}
                                    onChange={(event) =>
                                      setReceiveQuantities((prev) => ({
                                        ...prev,
                                        [prodId]: event.target.value,
                                      }))
                                    }
                                    className="h-8"
                                  />
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start border-t border-border pt-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block font-semibold">Notes / Instructions</span>
                    <p className="text-sm italic text-muted-foreground">
                      {selectedPO.notes || "No notes attached to this purchase order."}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-sm bg-secondary/30 p-4 rounded-xl min-w-[200px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>${selectedPO.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>${selectedPO.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border my-1 pt-1 flex justify-between font-bold text-primary">
                      <span>Total:</span>
                      <span>${selectedPO.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BOXES */}
                <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                    Close
                  </Button>

                  {/* APPROVAL ACTION */}
                  {(selectedPO.status === "pending_approval" || selectedPO.status === "draft") && (
                    <>
                      {isAuthorizedToApprove ? (
                        <Button onClick={handleApprovePO} disabled={approving} className="bg-primary hover:bg-primary/95 text-primary-foreground">
                          {approving ? "Approving..." : "Approve Purchase Order"}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-warning bg-warning/5 border border-warning/20 px-3 py-2 rounded-lg">
                          <ShieldAlert className="w-4 h-4 text-warning" />
                          <span>Requires Manager or Admin role to approve budget.</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* INTAKE ACTION */}
                  {["approved", "ordered"].includes(selectedPO.status) && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button variant="outline" onClick={handleReceiveAllPO} disabled={receiving}>
                        Mark All Received
                      </Button>
                      <Button onClick={handleReceivePO} disabled={receiving}>
                        {receiving ? "Logging intake..." : "Log Selected Intake"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
