import { useEffect, useMemo, useState } from "react"
import { Pencil, Plus, RefreshCw, Search, Users } from "lucide-react"
import {
  createCustomer,
  getCustomers,
  updateCustomer,
} from "../services/customers"
import type { Customer } from "../types"
import { Button } from "../components/ui/button"
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
import { Textarea } from "../components/ui/textarea"

type CustomerForm = {
  name: string
  mobile: string
  email: string
  address: string
  gstin: string
  tags: string
}

const emptyForm: CustomerForm = {
  name: "",
  mobile: "",
  email: "",
  address: "",
  gstin: "",
  tags: "",
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

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchCustomers = async (searchTerm?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCustomers(searchTerm)
      setCustomers(data)
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load customers"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchCustomers(search.trim() || undefined)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [search])

  const customerCountLabel = useMemo(
    () => `${customers.length} customer${customers.length === 1 ? "" : "s"}`,
    [customers.length]
  )

  const openCreateDialog = () => {
    setEditingCustomer(null)
    setForm(emptyForm)
    setSubmitError(null)
    setDialogOpen(true)
  }

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setForm({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email ?? "",
      address: customer.address ?? "",
      gstin: customer.gstin ?? "",
      tags: customer.tags.join(", "),
    })
    setSubmitError(null)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.mobile.trim()) {
      setSubmitError("Name and mobile are required")
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      gstin: form.gstin.trim() || undefined,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, payload)
      } else {
        await createCustomer(payload)
      }
      setDialogOpen(false)
      setForm(emptyForm)
      await fetchCustomers(search.trim() || undefined)
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Unable to save customer"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Customers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="mt-1 text-muted-foreground">
              Track profiles, loyalty, and purchase relationships.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchCustomers(search.trim() || undefined)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, mobile, or email..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center justify-center rounded-xl border border-border bg-card px-4 text-sm text-muted-foreground">
          {customerCountLabel}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => fetchCustomers(search.trim() || undefined)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="mb-4 flex justify-center">
            <Users className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No customers found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search ? "Try another search term." : "Add your first customer to start linking sales."}
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Loyalty Points</TableHead>
                <TableHead>Total Purchases</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.mobile}</TableCell>
                  <TableCell>{customer.email || "-"}</TableCell>
                  <TableCell>{customer.loyaltyPoints}</TableCell>
                  <TableCell>${customer.totalPurchases.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(customer)}
                      aria-label={`Edit ${customer.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
            <DialogDescription>
              Save contact details to attach sales and build purchase history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {submitError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Customer name *"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <Input
                placeholder="Mobile number *"
                value={form.mobile}
                onChange={(event) => setForm({ ...form, mobile: event.target.value })}
              />
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
              <Input
                placeholder="GSTIN"
                value={form.gstin}
                onChange={(event) => setForm({ ...form, gstin: event.target.value })}
              />
            </div>
            <Textarea
              placeholder="Address"
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
            />
            <Input
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingCustomer ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
