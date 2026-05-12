import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, Loader2, RefreshCw, WandSparkles } from "lucide-react"
import { getCategories } from "../services/categories"
import { createProduct, getProductById, updateProduct } from "../services/products"
import type { Category, Product } from "../types"
import { cn } from "../components/ui/utils"
import { Button } from "../components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb"
import { Calendar } from "../components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form"
import { Input } from "../components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Skeleton } from "../components/ui/skeleton"
import { Textarea } from "../components/ui/textarea"

type ProductFormValues = {
  sku: string
  name: string
  category: string
  description: string
  buyingPrice: string
  sellingPrice: string
  mrp: string
  unit: Product["unit"]
  quantity: string
  minStock: string
  maxStock: string
  location: string
  barcode: string
  image: string
  expiryDate: Date | undefined
}

type ProductFormProps = {
  mode: "create" | "edit"
  productId?: string
  onNavigate: (path: string) => void
}

const defaultValues: ProductFormValues = {
  sku: "",
  name: "",
  category: "",
  description: "",
  buyingPrice: "",
  sellingPrice: "",
  mrp: "",
  unit: "piece",
  quantity: "0",
  minStock: "5",
  maxStock: "100",
  location: "",
  barcode: "",
  image: "",
  expiryDate: undefined,
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

const toNumericValue = (value: string, fallback: number) => {
  if (value.trim() === "") return fallback
  return Number(value)
}

const generateSku = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let index = 0; index < 8; index += 1) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `PRD-${token}`
}

export function ProductForm({ mode, productId, onNavigate }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingProduct, setLoadingProduct] = useState(mode === "edit")
  const [pageError, setPageError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<ProductFormValues>({
    defaultValues,
    mode: "onBlur",
  })

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories]
  )

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const data = await getCategories({ isActive: true })
        setCategories(data)
      } catch (err) {
        setPageError(
          getErrorMessage(err, "Unable to load categories for this form.")
        )
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    if (mode !== "edit" || !productId) return

    const loadProduct = async () => {
      setLoadingProduct(true)
      try {
        const product = await getProductById(productId)
        form.reset({
          sku: product.sku,
          name: product.name,
          category:
            typeof product.category === "string"
              ? product.category
              : product.category._id,
          description: product.description ?? "",
          buyingPrice: String(product.buyingPrice),
          sellingPrice: String(product.sellingPrice),
          mrp: String(product.mrp),
          unit: product.unit,
          quantity: String(product.quantity),
          minStock: String(product.minStock),
          maxStock: String(product.maxStock),
          location: product.location ?? "",
          barcode: product.barcode ?? "",
          image: product.image ?? "",
          expiryDate: product.expiryDate ? new Date(product.expiryDate) : undefined,
        })
      } catch (err) {
        setPageError(getErrorMessage(err, "Unable to load product details."))
      } finally {
        setLoadingProduct(false)
      }
    }

    loadProduct()
  }, [form, mode, productId])

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      sku: values.sku.trim() || undefined,
      name: values.name.trim(),
      category: values.category,
      description: values.description.trim() || undefined,
      buyingPrice: Number(values.buyingPrice),
      sellingPrice: Number(values.sellingPrice),
      mrp: Number(values.mrp),
      unit: values.unit,
      quantity: toNumericValue(values.quantity, 0),
      minStock: toNumericValue(values.minStock, 5),
      maxStock: toNumericValue(values.maxStock, 100),
      location: values.location.trim() || undefined,
      barcode: values.barcode.trim() || undefined,
      image: values.image.trim() || undefined,
      expiryDate: values.expiryDate
        ? values.expiryDate.toISOString()
        : undefined,
    }

    try {
      if (mode === "edit" && productId) {
        await updateProduct(productId, payload)
      } else {
        await createProduct(payload)
      }
      onNavigate("/inventory")
    } catch (err) {
      const message = getErrorMessage(err, "Unable to save the product.")
      if (message.toLowerCase().includes("sku")) {
        form.setError("sku", { type: "server", message })
      } else {
        setSubmitError(message)
      }
    } finally {
      setSubmitting(false)
    }
  })

  if (loadingCategories || loadingProduct) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-56" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-5 w-80" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <span className="text-muted-foreground">Inventory</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {mode === "edit" ? "Edit Product" : "Add Product"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-bold">
              {mode === "edit" ? "Edit Product" : "Add Product"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage product details, pricing, and stock settings.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="mb-4 text-sm text-muted-foreground">{pageError}</p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => onNavigate("/inventory")}>
              Back to Inventory
            </Button>
            <Button onClick={() => window.location.reload()}>
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
                onClick={() => onNavigate("/inventory")}
              >
                Inventory
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {mode === "edit" ? "Edit Product" : "Add Product"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {mode === "edit" ? "Edit Product" : "Create Product"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Configure pricing, inventory limits, and catalog details.
            </p>
          </div>
          <Button variant="outline" onClick={() => onNavigate("/inventory")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <Form {...form}>
          <form className="space-y-6" onSubmit={onSubmit}>
            {submitError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="PRD-xxxxxxxx" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.setValue("sku", generateSku(), { shouldDirty: true })}
                      >
                        <WandSparkles className="mr-2 h-4 w-4" />
                        Auto-generate
                      </Button>
                    </div>
                    <FormDescription>
                      Leave blank to let the backend generate one.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Product name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Organic Milk 1L" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeCategories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["piece", "kg", "liter", "pack", "box"].map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional product notes, ingredients, or packaging details"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="buyingPrice"
                rules={{
                  required: "Buying price is required",
                  validate: (value) =>
                    Number(value) > 0 || "Buying price must be greater than 0",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buying Price *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sellingPrice"
                rules={{
                  required: "Selling price is required",
                  validate: (value) =>
                    Number(value) > 0 || "Selling price must be greater than 0",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mrp"
                rules={{
                  required: "MRP is required",
                  validate: (value) => Number(value) > 0 || "MRP must be greater than 0",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MRP *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                rules={{
                  validate: (value) =>
                    Number(value) >= 0 || "Quantity cannot be negative",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Aisle 4 / Shelf B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional barcode value" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/product.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onNavigate("/inventory")}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "edit" ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
