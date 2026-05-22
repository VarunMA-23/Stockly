import { useEffect, useState } from "react"
import { Download, RefreshCw } from "lucide-react"
import { downloadSalePdf, getSaleById } from "../services/sales"
import type { Customer, Product, Sale, User } from "../types"
import { formatCurrency } from "../utils/formatters"
import { Button } from "../components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb"
import { Skeleton } from "../components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

type SaleDetailProps = {
  saleId: string
  onNavigate: (path: string) => void
}

const getCustomerName = (customer?: string | Customer | null) => {
  if (!customer) return "Walk-in Customer"
  return typeof customer === "string" ? customer : customer.name
}

const getCashierName = (cashier: string | User) =>
  typeof cashier === "string" ? cashier : cashier.name

const getProductName = (product: string | Product, fallback: string) =>
  typeof product === "string" ? fallback : product.name

export function SaleDetail({ saleId, onNavigate }: SaleDetailProps) {
  const [sale, setSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const fetchSale = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSaleById(saleId)
      setSale(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load invoice")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSale()
  }, [saleId])

  const handleDownload = async () => {
    if (!sale) return
    setDownloading(true)
    try {
      const blob = await downloadSalePdf(sale._id)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `${sale.invoiceNo}.pdf`
      anchor.click()
      window.URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (error || !sale) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            {error || "Invoice not found"}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => onNavigate("/sales")}>
              Back to Sales
            </Button>
            <Button onClick={fetchSale}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <button
                type="button"
                className="text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => onNavigate("/sales")}
              >
                Sales
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{sale.invoiceNo}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invoice {sale.invoiceNo}</h1>
            <p className="mt-1 text-muted-foreground">
              Completed on {new Date(sale.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onNavigate("/sales")}>
              Back to Sales
            </Button>
            <Button onClick={handleDownload} disabled={downloading}>
              <Download className="mr-2 h-4 w-4" />
              {downloading ? "Downloading..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold">Customer</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {getCustomerName(sale.customer)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold">Cashier</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {getCashierName(sale.cashier)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold">Payment</h3>
          <p className="mt-2 text-sm uppercase text-muted-foreground">
            {sale.paymentMethod}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.items.map((item, index) => (
              <TableRow key={`${sale._id}-${index}`}>
                <TableCell>{getProductName(item.product, item.name)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="ml-auto w-full max-w-sm rounded-xl border border-border bg-card p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>-{formatCurrency(sale.discountAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(sale.taxAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tendered</span>
            <span>{formatCurrency(sale.amountTendered)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Change</span>
            <span>{formatCurrency(sale.changeAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
