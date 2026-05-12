import { useMemo, useState } from "react"
import {
  ChevronRight,
  FolderTree,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { useCategories } from "../hooks/useCategories"
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../services/categories"
import type { Category } from "../types"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
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
import { Textarea } from "../components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"

type CategoryForm = {
  name: string
  description: string
  parentCategory: string
}

type FlattenedCategory = {
  category: Category
  depth: number
}

const NONE = "none"
const emptyForm: CategoryForm = {
  name: "",
  description: "",
  parentCategory: NONE,
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

export function Categories() {
  const { categories, loading, error, refetch } = useCategories()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categories) {
      map.set(category._id, category.name)
    }
    return map
  }, [categories])

  const rootCategories = useMemo(
    () => categories.filter((category) => !category.parentCategory),
    [categories]
  )

  const flattenedCategories = useMemo(() => {
    const childrenByParent = new Map<string | null, Category[]>()

    for (const category of categories) {
      const parentId =
        typeof category.parentCategory === "string"
          ? category.parentCategory
          : category.parentCategory?._id ?? null
      const siblings = childrenByParent.get(parentId) ?? []
      siblings.push(category)
      childrenByParent.set(parentId, siblings)
    }

    for (const siblings of childrenByParent.values()) {
      siblings.sort((a, b) => a.name.localeCompare(b.name))
    }

    const result: FlattenedCategory[] = []

    const walk = (parentId: string | null, depth: number) => {
      const children = childrenByParent.get(parentId) ?? []
      for (const child of children) {
        result.push({ category: child, depth })
        walk(child._id, depth + 1)
      }
    }

    walk(null, 0)

    return result
  }, [categories])

  const openAddDialog = () => {
    setEditingCategory(null)
    setForm(emptyForm)
    setSubmitError(null)
    setDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setSubmitError(null)

    const parentId =
      typeof category.parentCategory === "string"
        ? category.parentCategory
        : category.parentCategory?._id ?? ""

    setForm({
      name: category.name,
      description: category.description ?? "",
      parentCategory: parentId || NONE,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        parentCategory:
          form.parentCategory === NONE ? null : form.parentCategory,
      }

      if (editingCategory) {
        await updateCategory(editingCategory._id, payload)
      } else {
        await createCategory(payload)
      }

      setDialogOpen(false)
      setEditingCategory(null)
      setForm(emptyForm)
      await refetch()
    } catch (err) {
      setSubmitError(
        getErrorMessage(err, "Unable to save the category. Please try again.")
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleteSubmitting(true)
    setDeleteError(null)

    try {
      await deleteCategory(deleteTarget._id)
      setDeleteOpen(false)
      setDeleteTarget(null)
      await refetch()
    } catch (err) {
      setDeleteError(
        getErrorMessage(err, "Unable to deactivate the category right now.")
      )
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const getParentName = (category: Category) => {
    if (!category.parentCategory) return "-"

    const parentId =
      typeof category.parentCategory === "string"
        ? category.parentCategory
        : category.parentCategory._id

    return categoryMap.get(parentId) ?? "Unknown"
  }

  const heading = (
    <div className="space-y-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span className="text-muted-foreground">Settings</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Categories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="mt-1 text-muted-foreground">
          Manage product categories and subcategories
        </p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        {heading}
        <div className="rounded-xl border border-border bg-card">
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {heading}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <FolderTree className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">Failed to load categories</h3>
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
        {heading}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderTree className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No categories found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Get started by creating your first category.
          </p>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flattenedCategories.map(({ category, depth }) => (
                <TableRow key={category._id}>
                  <TableCell className="font-medium">
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: `${depth * 20}px` }}
                    >
                      {depth > 0 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getParentName(category)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${category.name}`}
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {category.isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Deactivate ${category.name}`}
                          onClick={() => {
                            setDeleteTarget(category)
                            setDeleteError(null)
                            setDeleteOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setSubmitError(null)
            setEditingCategory(null)
            setForm(emptyForm)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details below."
                : "Fill in the details to create a new category."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {submitError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                placeholder="Category name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Optional description"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Parent Category</label>
              <Select
                value={form.parentCategory}
                onValueChange={(value) =>
                  setForm({ ...form, parentCategory: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (root category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None (root category)</SelectItem>
                  {rootCategories
                    .filter(
                      (category) =>
                        category.isActive &&
                        (!editingCategory || category._id !== editingCategory._id)
                    )
                    .map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!form.name.trim() || submitting}>
              {submitting
                ? "Saving..."
                : editingCategory
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) {
            setDeleteError(null)
            setDeleteTarget(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate{" "}
              <strong>{deleteTarget?.name}</strong>? This will hide it from
              selection menus but can be re-activated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {deleteError}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteSubmitting ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
