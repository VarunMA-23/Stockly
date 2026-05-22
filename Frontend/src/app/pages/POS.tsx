import { useEffect, useMemo, useState } from "react"
import {
  Barcode,
  CreditCard,
  Minus,
  Package,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react"
import { getCategories } from "../services/categories"
import { getCustomers } from "../services/customers"
import { getProducts } from "../services/products"
import { createSale } from "../services/sales"
import { formatCurrency } from "../utils/formatters"
import type { Category, Customer, Product } from "../types"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"


type POSProps = {
  onNavigate: (path: string) => void
}

type CartItem = {
  product: Product
  quantity: number
}

const paymentMethods: Array<"cash" | "card" | "upi" | "wallet" | "split"> = [
  "cash",
  "card",
  "upi",
  "wallet",
  "split",
]

const getCategoryName = (category: Product["category"]) =>
  typeof category === "string" ? category : category.name

export function POS({ onNavigate }: POSProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState("walk-in")
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "upi" | "wallet" | "split"
  >("cash")
  const [amountTendered, setAmountTendered] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [scanDialogOpen, setScanDialogOpen] = useState(false)
  const [scanValue, setScanValue] = useState("")

  const handleSimulatedScan = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    const matchedProduct = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === trimmed.toLowerCase()) ||
        p.sku.toLowerCase() === trimmed.toLowerCase()
    )

    if (matchedProduct) {
      if (matchedProduct.quantity <= 0) {
        alert(`${matchedProduct.name} is out of stock`)
        return
      }
      addToCart(matchedProduct)
      setScanDialogOpen(false)
      setScanValue("")
      setSearch("") // Reset search on successful add
    } else {
      alert(`No product found matching barcode/SKU: "${trimmed}"`)
    }
  }


  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [categoryData, productResponse, customerData] = await Promise.all([
          getCategories({ isActive: true }),
          getProducts({ isActive: true, page: 1, limit: 100 }),
          getCustomers(),
        ])
        setCategories(categoryData)
        setProducts(productResponse.data)
        setCustomers(customerData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load POS data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        (typeof product.category === "string"
          ? product.category === selectedCategory
          : product.category._id === selectedCategory)

      const matchesSearch =
        !search.trim() ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [products, search, selectedCategory])

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.product._id === product._id)
      if (existing) {
        return current.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity) }
            : item
        )
      }
      return [...current, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.product._id !== productId) return item
          const nextQuantity = Math.max(0, Math.min(item.quantity + delta, item.product.quantity))
          return { ...item, quantity: nextQuantity }
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.sellingPrice * item.quantity,
        0
      ),
    [cart]
  )
  const taxPercent = 10
  const discountAmount = ((subtotal || 0) * discount) / 100
  const taxableBase = subtotal - discountAmount
  const tax = (taxableBase * taxPercent) / 100
  const total = Math.max(0, taxableBase + tax)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutError("Add at least one product to complete a sale")
      return
    }

    const tendered = Number(amountTendered || total)
    if (Number.isNaN(tendered) || tendered < total) {
      setCheckoutError("Amount tendered must cover the invoice total")
      return
    }

    setSubmitting(true)
    setCheckoutError(null)

    try {
      const sale = await createSale({
        customer: selectedCustomer === "walk-in" ? undefined : selectedCustomer,
        items: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        discountPercent: discount,
        taxPercent,
        paymentMethod,
        amountTendered: tendered,
      })

      onNavigate(`/sales/${sale._id}`)
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Unable to complete sale")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading POS...</div>
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="mb-4 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => onNavigate("/sales")}>Back to Sales</Button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4 -m-6">
      <div className="w-56 space-y-2 overflow-y-auto border-r border-border bg-card p-4">
        <h3 className="font-semibold">Categories</h3>
        <button
          onClick={() => setSelectedCategory("all")}
          className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
            selectedCategory === "all" ? "bg-primary text-white" : "hover:bg-accent"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => setSelectedCategory(category._id)}
            className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
              selectedCategory === category._id
                ? "bg-primary text-white"
                : "hover:bg-accent"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-card p-6">
        <div className="mb-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleSimulatedScan(search)
                }
              }}
              placeholder="Search or scan barcode..."
              className="pl-10 pr-12"
            />
            <button
              onClick={() => setScanDialogOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 hover:bg-accent"
              type="button"
            >
              <Barcode className="h-4 w-4" />
            </button>

          </div>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Walk-in Customer</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer._id} value={customer._id}>
                  {customer.name} - {customer.mobile}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <button
              key={product._id}
              onClick={() => addToCart(product)}
              className="rounded-xl bg-secondary/30 p-4 text-left transition-all hover:scale-[1.02] hover:bg-secondary/50"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {getCategoryName(product.category)}
                </div>
                <span className="text-xs text-muted-foreground">
                  Stock {product.quantity}
                </span>
              </div>
              <h4 className="mb-1 font-medium">{product.name}</h4>
              <p className="text-sm text-muted-foreground">{product.sku}</p>
              <p className="mt-3 text-lg font-bold text-primary">
                {formatCurrency(product.sellingPrice)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-[26rem] flex-col border-l border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-bold">Current Order</h2>

        <div className="mb-4 rounded-lg bg-secondary/30 p-3 text-sm">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {selectedCustomer === "walk-in"
                ? "Walk-in Customer"
                : customers.find((customer) => customer._id === selectedCustomer)?.name || "Customer"}
            </span>
          </div>
        </div>

        <div className="mb-4 flex-1 space-y-2 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <Package className="mb-2 h-16 w-16 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product._id}
                className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.product.sellingPrice)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product._id, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-background transition-colors hover:bg-accent"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-background transition-colors hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => updateQuantity(item.product._id, -item.quantity)}
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mb-4 rounded-lg bg-secondary/30 p-3">
          <label className="mb-2 block text-sm font-medium">Discount %</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={String(discount)}
            onChange={(event) => setDiscount(Number(event.target.value) || 0)}
          />
        </div>

        <div className="mb-4 space-y-2 border-b border-border pb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {paymentMethods.map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`rounded-lg border px-4 py-3 font-medium capitalize transition-colors ${
                paymentMethod === method
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-background hover:bg-accent"
              }`}
            >
              {method}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Amount Tendered</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amountTendered}
            onChange={(event) => setAmountTendered(event.target.value)}
            placeholder={total.toFixed(2)}
          />
        </div>

        {checkoutError && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {checkoutError}
          </div>
        )}

        <Button
          disabled={cart.length === 0 || submitting}
          onClick={handleCheckout}
          className="w-full py-6"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          {submitting ? "Completing Payment..." : "Complete Payment"}
        </Button>
      </div>

      {/* Simulated Scanner Dialog */}
      <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Simulated Barcode Scanner</DialogTitle>
            <DialogDescription>
              Type or select a product's barcode/SKU to simulate scanning with a hardware reader.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Barcode / SKU Value</label>
              <div className="flex gap-2">
                <Input
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSimulatedScan(scanValue)
                    }
                  }}
                  placeholder="Enter barcode or SKU..."
                />
                <Button onClick={() => handleSimulatedScan(scanValue)}>Scan</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground block">
                Active Catalog Barcodes (Click to Scan)
              </label>
              <div className="max-h-[200px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {products.length === 0 ? (
                  <div className="p-3 text-center text-xs text-muted-foreground">No products available</div>
                ) : (
                  products.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => handleSimulatedScan(p.barcode || p.sku)}
                      className="w-full text-left p-2.5 text-xs hover:bg-accent flex justify-between items-center transition-colors"
                      type="button"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{p.name}</div>
                        <div className="text-muted-foreground font-mono mt-0.5">SKU: {p.sku}</div>
                      </div>
                      {p.barcode ? (
                        <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          {p.barcode}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Use SKU</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScanDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

