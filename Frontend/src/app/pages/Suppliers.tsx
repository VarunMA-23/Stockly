import { useEffect, useMemo, useState } from "react"
import { Pencil, Plus, RefreshCw, Search, Truck, Star, CheckCircle2, AlertCircle } from "lucide-react"
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
} from "../services/suppliers"
import type { Supplier } from "../types"
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

type SupplierForm = {
  name: string
  contactPerson: string
  mobile: string
  email: string
  address: string
  gstin: string
  avgDeliveryDays: string
  qualityRating: string
  reliabilityScore: string
  onTimeDeliveryRate: string
}

const emptyForm: SupplierForm = {
  name: "",
  contactPerson: "",
  mobile: "",
  email: "",
  address: "",
  gstin: "",
  avgDeliveryDays: "3",
  qualityRating: "5",
  reliabilityScore: "100",
  onTimeDeliveryRate: "100",
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

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [form, setForm] = useState<SupplierForm>(emptyForm)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchSuppliers = async (searchTerm?: string, filterActive?: "all" | "active" | "inactive") => {
    setLoading(true)
    setError(null)
    try {
      const activeParam =
        filterActive === "active" ? true : filterActive === "inactive" ? false : undefined
      const data = await getSuppliers(searchTerm, activeParam)
      setSuppliers(data)
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load suppliers"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchSuppliers(search.trim() || undefined, statusFilter)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [search, statusFilter])

  const supplierCountLabel = useMemo(
    () => `${suppliers.length} supplier${suppliers.length === 1 ? "" : "s"}`,
    [suppliers.length]
  )

  const openCreateDialog = () => {
    setEditingSupplier(null)
    setForm(emptyForm)
    setSubmitError(null)
    setDialogOpen(true)
  }

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson ?? "",
      mobile: supplier.mobile,
      email: supplier.email ?? "",
      address: supplier.address ?? "",
      gstin: supplier.gstin ?? "",
      avgDeliveryDays: String(supplier.performance?.avgDeliveryDays ?? 3),
      qualityRating: String(supplier.performance?.qualityRating ?? 5),
      reliabilityScore: String(supplier.performance?.reliabilityScore ?? 100),
      onTimeDeliveryRate: String(supplier.performance?.onTimeDeliveryRate ?? 100),
    })
    setSubmitError(null)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.mobile.trim()) {
      setSubmitError("Supplier name and mobile number are required")
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      name: form.name.trim(),
      contactPerson: form.contactPerson.trim() || undefined,
      mobile: form.mobile.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      gstin: form.gstin.trim() || undefined,
      performance: {
        avgDeliveryDays: Number(form.avgDeliveryDays) || 3,
        qualityRating: Number(form.qualityRating) || 5,
        reliabilityScore: Number(form.reliabilityScore) || 100,
        onTimeDeliveryRate: Number(form.onTimeDeliveryRate) || 100,
      },
    }

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, payload)
      } else {
        await createSupplier(payload)
      }
      setDialogOpen(false)
      setForm(emptyForm)
      await fetchSuppliers(search.trim() || undefined, statusFilter)
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Unable to save supplier"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeactivate = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this supplier?")) return

    try {
      await deleteSupplier(id)
      await fetchSuppliers(search.trim() || undefined, statusFilter)
    } catch (err) {
      alert(getErrorMessage(err, "Unable to deactivate supplier"))
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < rating ? "text-warning fill-warning" : "text-muted-foreground/30"
            }`}
          />
        ))}
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
                <BreadcrumbPage>Suppliers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-bold">Supplier Management</h1>
            <p className="mt-1 text-muted-foreground">
              Manage suppliers, monitor delivery performance metrics, and track procurement relationships.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchSuppliers(search.trim() || undefined, statusFilter)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_160px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by supplier name, contact person, mobile..."
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center justify-center rounded-xl border border-border bg-card px-4 text-sm text-muted-foreground font-medium">
          {supplierCountLabel}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => fetchSuppliers(search.trim() || undefined, statusFilter)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="mb-4 flex justify-center">
            <Truck className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No suppliers found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search || statusFilter !== "all"
              ? "Try adjusting your search query or status filter."
              : "Register your first supplier to configure inventory procurements."}
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>GSTIN</TableHead>
                <TableHead>Quality Rating</TableHead>
                <TableHead>On-time Rate</TableHead>
                <TableHead>Reliability Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier._id}>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{supplier.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {supplier.contactPerson ? `Contact: ${supplier.contactPerson}` : "No contact person"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{supplier.mobile}</div>
                      <div className="text-muted-foreground">{supplier.email || "-"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {supplier.gstin || "-"}
                  </TableCell>
                  <TableCell>
                    {renderStars(supplier.performance?.qualityRating ?? 5)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-info/20 bg-info/10 text-info">
                      {supplier.performance?.onTimeDeliveryRate ?? 100}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      {supplier.performance?.reliabilityScore ?? 100}/100
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        supplier.isActive
                          ? "border-success/20 bg-success/10 text-success"
                          : "border-destructive/20 bg-destructive/10 text-destructive"
                      }
                    >
                      {supplier.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(supplier)}
                        aria-label={`Edit ${supplier.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {supplier.isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => handleDeactivate(supplier._id)}
                          aria-label={`Deactivate ${supplier.name}`}
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Edit Supplier profile" : "Register Supplier"}
            </DialogTitle>
            <DialogDescription>
              Provide contact and location details to establish procurement tracking.
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
                <label className="text-xs font-semibold text-muted-foreground">Supplier Name *</label>
                <Input
                  placeholder="e.g. Fresh Foods Ltd"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Contact Person</label>
                <Input
                  placeholder="e.g. John Doe"
                  value={form.contactPerson}
                  onChange={(event) => setForm({ ...form, contactPerson: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Mobile Number *</label>
                <Input
                  placeholder="e.g. +1 555-0199"
                  value={form.mobile}
                  onChange={(event) => setForm({ ...form, mobile: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Email</label>
                <Input
                  placeholder="e.g. sales@freshfoods.com"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">GSTIN (Optional)</label>
                <Input
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  value={form.gstin}
                  onChange={(event) => setForm({ ...form, gstin: event.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Address</label>
              <Textarea
                placeholder="Supplier headquarters address..."
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
              />
            </div>
            
            <div className="border-t border-border pt-3">
              <h4 className="text-sm font-semibold mb-3">Performance Metrics (Initial Ratings)</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Avg Delivery Days</label>
                  <Input
                    type="number"
                    min="1"
                    value={form.avgDeliveryDays}
                    onChange={(event) => setForm({ ...form, avgDeliveryDays: event.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Quality Rating (1-5)</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={form.qualityRating}
                    onChange={(event) => setForm({ ...form, qualityRating: event.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Reliability Score (0-100)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.reliabilityScore}
                    onChange={(event) => setForm({ ...form, reliabilityScore: event.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">On-time Delivery Rate (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.onTimeDeliveryRate}
                    onChange={(event) => setForm({ ...form, onTimeDeliveryRate: event.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingSupplier ? "Update Supplier" : "Create Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
