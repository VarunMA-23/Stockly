import { useEffect, useState } from "react"
import { Receipt, RefreshCw } from "lucide-react"
import { getSales } from "../services/sales"
import type { Customer, Sale, User } from "../types"
import { formatCurrency } from "../utils/formatters"
import { Button } from "../components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
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

type SalesProps = {
  onNavigate: (path: string) => void
}

const getCustomerName = (customer?: string | Customer | null) => {
  if (!customer) return "Walk-in"
  return typeof customer === "string" ? customer : customer.name
}

const getCashierName = (cashier: string | User) =>
  typeof cashier === "string" ? cashier : cashier.name

export function Sales({ onNavigate }: SalesProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSales()
      setSales(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load sales")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Sales</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-bold">Sales History</h1>
            <p className="mt-1 text-muted-foreground">
              Review completed invoices and open detailed receipts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSales}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => onNavigate("/pos")}>
            <Receipt className="mr-2 h-4 w-4" />
            Open POS
          </Button>
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
          <Button onClick={fetchSales}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : sales.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <h3 className="mb-1 text-lg font-semibold">No sales recorded yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Complete a sale from the POS to populate invoice history.
          </p>
          <Button onClick={() => onNavigate("/pos")}>
            <Receipt className="mr-2 h-4 w-4" />
            Start a Sale
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                  <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{getCustomerName(sale.customer)}</TableCell>
                  <TableCell>{getCashierName(sale.cashier)}</TableCell>
                  <TableCell className="uppercase">{sale.paymentMethod}</TableCell>
                  <TableCell>{formatCurrency(sale.total)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate(`/sales/${sale._id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
