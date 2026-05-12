# Phase 1 — Core Foundation (Weeks 1–2)

## 1. Objective

Establish the base of the application: auth with roles, multi-store support, and the core inventory data models (Category, Product) with full CRUD on both backend and frontend. The existing Figma-generated UI is wired to real API calls; no mock data remains in the pages touched by Phase 1.

---

## 2. Deliverables

| # | Deliverable | Scope |
|---|------------|-------|
| D1 | Auth upgrade | Role-based auth (`admin`, `manager`, `cashier`, `warehouse`, `analyst`), refresh token flow, `/profile` endpoint |
| D2 | Store model | Multi-store support — `Store` schema, CRUD API, store context on User |
| D3 | Category CRUD | `Category` schema, backend API, frontend list/create/edit/delete |
| D4 | Product CRUD | `Product` schema, backend API, frontend list/create/edit/delete |
| D5 | Inventory list page | Wire existing `Inventory.tsx` to real API, add search, pagination |

---

## 3. Backend Changes

### 3.1 Existing Files to Modify

#### `Backend/config.js` — Add JWT config

```js
// ADD to exports:
export const jwt = {
  secret: process.env.JWT_SECRET || "fallback_dev_secret",
  accessExpiry: "15m",
  refreshExpiry: "7d",
  cookieExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
}
```

#### `Backend/database/index.js` — Update connection string

- Ensure `dbURI` uses `mongodb://127.0.0.1:27017/stockly` as fallback when no credentials are provided (for local dev).
- Add connection event listeners (`connected`, `error`, `disconnected`).

#### `Backend/models/userModel.js` — Extend schema

```js
// ADD fields to existing schema:
role: {
  type: String,
  enum: ["admin", "manager", "cashier", "warehouse", "analyst"],
  default: "cashier",
},
store: { type: Schema.Types.ObjectId, ref: "Store" },
isActive: { type: Boolean, default: true },
refreshToken: { type: String },
```

**Migration note**: The existing User schema lacks these fields. Since this is early-stage dev with no production data, drop the collection or add fields manually.

#### `Backend/utils/generateToken.js` — Upgrade to access + refresh

```js
// Replace existing single-token logic with dual-token:
// - generateAccessToken(userId)  → JWT exp 15m
// - generateRefreshToken(userId) → JWT exp 7d
// - setRefreshCookie(res, token)  → httpOnly cookie named "refreshJwt"
// - clearRefreshCookie(res)

// ACCESS TOKEN: short-lived, returned in JSON body
// REFRESH TOKEN: long-lived, stored in httpOnly cookie + DB
```

#### `Backend/middleware/authMiddleware.js` — Add role authorization

```js
// Rename existing `protect` → keep as-is but also decode refresh token support.

// ADD new export:
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403)
      throw new Error(`Role ${req.user.role} not authorized`)
    }
    next()
  }
}
```

#### `Backend/routes/userRoutes.js` — Add new endpoints

```js
// ADD routes:
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile)
router.route("/refresh").post(refreshToken)
router.route("/").get(protect, authorize("admin"), getUsers)
```

#### `Backend/controllers/userController.js` — Add handlers

| Function | Action |
|----------|--------|
| `registerUser` | Extend: accept `store` field, return access+refresh tokens |
| `loginUser` | Extend: store refreshToken in DB, return both tokens |
| `logoutUser` | Clear refresh cookie, remove refreshToken from DB |
| `refreshToken` | Verify refresh cookie, issue new access token |
| `getUserProfile` | Return `req.user` populated with store |
| `updateUserProfile` | Allow name, email, password update |
| `getUsers` | Admin-only: list all users |

#### `Backend/server.js` — Register new route groups

```js
// ADD imports:
import categoryRoutes from "./routes/categoryRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import storeRoutes from "./routes/storeRoutes.js"

// ADD after existing route registrations:
app.use("/api/categories", categoryRoutes)
app.use("/api/products", productRoutes)
app.use("/api/stores", storeRoutes)
```

---

### 3.2 New Backend Files to Create

#### **`Backend/models/storeModel.js`**

```js
const storeSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  gstin: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })
```

#### **`Backend/models/categoryModel.js`**

```js
const categorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: "" },
  image: { type: String },
  parentCategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })
```

Index: `{ name: 1 }` unique.

#### **`Backend/models/productModel.js`**

```js
const productSchema = new Schema({
  sku: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  description: { type: String, default: "" },
  buyingPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  unit: {
    type: String,
    enum: ["piece", "kg", "liter", "pack", "box"],
    default: "piece",
  },
  quantity: { type: Number, default: 0, min: 0 },
  minStock: { type: Number, default: 5 },
  maxStock: { type: Number, default: 100 },
  location: { type: String },
  supplier: { type: Schema.Types.ObjectId, ref: "Supplier", default: null },
  barcode: { type: String, sparse: true },
  image: { type: String },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })
```

Indexes: `{ sku: 1 }` unique, `{ name: "text", description: "text" }` for future search.

#### **`Backend/services/authService.js`**

```js
// Functions:
// - generateAccessToken(userId)
// - generateRefreshToken(userId)
// - verifyAccessToken(token)
// - verifyRefreshToken(token)
// - setRefreshCookie(res, token)
// - clearRefreshCookie(res)
// - hashPassword(password)
// - comparePassword(password, hashed)
```

Moves token logic from old `generateToken.js`. The old file can be deleted or re-exported from here.

#### **`Backend/routes/categoryRoutes.js`**

```js
router.route("/")
  .get(protect, getCategories)
  .post(protect, authorize("admin", "manager"), createCategory)

router.route("/:id")
  .get(protect, getCategoryById)
  .put(protect, authorize("admin", "manager"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory)
```

#### **`Backend/controllers/categoryController.js`**

| Function | Logic |
|----------|-------|
| `getCategories` | Find all, support `?isActive=true` filter, support `?parent=null` |
| `createCategory` | Validate name unique, create, return doc |
| `getCategoryById` | Find by ID, 404 if not found |
| `updateCategory` | Find by ID, update fields, return updated doc |
| `deleteCategory` | Soft-delete: set `isActive = false` (admin only) |

All use `express-async-handler` wrapper.

#### **`Backend/routes/productRoutes.js`**

```js
router.route("/")
  .get(protect, getProducts)
  .post(protect, authorize("admin", "manager"), createProduct)

router.route("/:id")
  .get(protect, getProductById)
  .put(protect, authorize("admin", "manager"), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct)
```

#### **`Backend/controllers/productController.js`**

| Function | Logic |
|----------|-------|
| `getProducts` | Paginated list. Support `?search` (regex on name/sku), `?category`, `?isActive`, `?minStock`, `?page`, `?limit`. Populate category. |
| `createProduct` | Validate SKU unique, generate auto-SKU if empty, create, return doc. Auto-SKU format: `PRD-{random8chars}` |
| `getProductById` | Populate category, 404 if not found |
| `updateProduct` | Find by ID, update fields, return updated doc |
| `deleteProduct` | Soft-delete: set `isActive = false` (admin only) |

Pagination response format:

```json
{
  "products": [...],
  "page": 1,
  "pages": 5,
  "total": 98
}
```

#### **`Backend/routes/storeRoutes.js`**

```js
router.route("/")
  .get(protect, authorize("admin"), getStores)
  .post(protect, authorize("admin"), createStore)

router.route("/:id")
  .get(protect, getStoreById)
  .put(protect, authorize("admin"), updateStore)
  .delete(protect, authorize("admin"), deleteStore)
```

#### **`Backend/controllers/storeController.js`**

Simple CRUD matching the pattern above. No soft-delete needed — just remove from DB or set `isActive = false`.

---

### 3.3 API Contract Summary (Phase 1)

#### Auth

| Method | Endpoint | Auth | Roles | Request Body | Response |
|--------|----------|------|-------|-------------|----------|
| POST | `/api/users/register` | — | — | `{name, email, password, store?}` | `{_id, name, email, role, store, accessToken}` + refresh cookie |
| POST | `/api/users/login` | — | — | `{email, password}` | `{_id, name, email, role, store, accessToken}` + refresh cookie |
| POST | `/api/users/logout` | Yes | any | — | `{message: "Logged out"}` + clear cookie |
| GET | `/api/users/profile` | Yes | any | — | `{_id, name, email, role, store: {…}}` |
| PUT | `/api/users/profile` | Yes | any | `{name?, email?, password?}` | Updated user object |
| POST | `/api/users/refresh` | — | — | (reads cookie) | `{accessToken}` |
| GET | `/api/users` | Yes | admin | — | `[{user}, …]` |

#### Stores

| Method | Endpoint | Auth | Roles | Request Body | Response |
|--------|----------|------|-------|-------------|----------|
| GET | `/api/stores` | Yes | admin | — | `[{store}, …]` |
| POST | `/api/stores` | Yes | admin | `{name, address?, phone?, gstin?}` | Created store |
| GET | `/api/stores/:id` | Yes | any | — | Store object |
| PUT | `/api/stores/:id` | Yes | admin | `{name?, address?, …}` | Updated store |
| DELETE | `/api/stores/:id` | Yes | admin | — | `{message: "deleted"}` |

#### Categories

| Method | Endpoint | Auth | Roles | Request Body | Response |
|--------|----------|------|-------|-------------|----------|
| GET | `/api/categories` | Yes | any | — | `[{category}, …]` |
| POST | `/api/categories` | Yes | admin, manager | `{name, description?, parentCategory?}` | Created category |
| GET | `/api/categories/:id` | Yes | any | — | Category object |
| PUT | `/api/categories/:id` | Yes | admin, manager | `{name?, description?, …}` | Updated category |
| DELETE | `/api/categories/:id` | Yes | admin | — | `{message: "deactivated"}` |

#### Products

| Method | Endpoint | Auth | Roles | Request Body | Response |
|--------|----------|------|-------|-------------|----------|
| GET | `/api/products` | Yes | any | Query: `?search=&category=&page=&limit=&minStock=&isActive=` | `{products, page, pages, total}` |
| POST | `/api/products` | Yes | admin, manager | `{sku?, name, category, description?, buyingPrice, sellingPrice, mrp, unit, quantity?, minStock?, maxStock?, location?, barcode?, image?, expiryDate?}` | Created product |
| GET | `/api/products/:id` | Yes | any | — | Product (populated category) |
| PUT | `/api/products/:id` | Yes | admin, manager | `{field?: value, …}` | Updated product |
| DELETE | `/api/products/:id` | Yes | admin | — | `{message: "deactivated"}` |

---

### 3.4 Backend Error Handling Convention

All controllers return errors in this shape:

```json
{
  "message": "Human-readable error description",
  "stack": "…" // only in development
}
```

HTTP status codes:
- `200` — Success
- `201` — Created
- `400` — Validation error / bad request
- `401` — Not authenticated
- `403` — Not authorized (wrong role)
- `404` — Resource not found
- `500` — Server error

---

## 4. Frontend Changes

### 4.1 Existing Files to Modify

#### **`Frontend/src/app/App.tsx`** — Minimal changes

- Add API-based auth state (context or simple state). Replace `isAuthenticated` hard-coded `true` with real check (check for accessToken in memory/ localStorage).
- Pass `onNavigate` to all page components that need it.
- Keep `ComingSoon` placeholders for out-of-scope routes.

#### **`Frontend/src/app/components/MainLayout.tsx`** — Keep as-is

The layout, sidebar, topbar, mobile nav — all keep. Need to ensure they can receive auth state (user name, role, store) for display.

#### **`Frontend/src/app/components/Sidebar.tsx`** — No changes

Navigation items already exist. Keep.

#### **`Frontend/src/app/components/Topbar.tsx`** — Wire user data

Replace hard-coded "John Doe" with `user.name` from auth context. Replace store placeholder with `user.store.name`. Hook up search bar if needed for Phase 1 (search can remain visual-only for now).

#### **`Frontend/src/app/pages/Login.tsx`** — Wire to API

- Import `authService.login(email, password)` from `services/auth.ts`
- On submit: call API, store accessToken (memory or httpOnly is better — but for SPA, in-memory variable with refresh flow), store user object in React context/state
- Show validation errors from API below form fields
- On success: navigate to `/` (dashboard)
- Keep the Google sign-in button but it can be non-functional (place `onClick` handler with a toast "Coming soon")

#### **`Frontend/src/app/pages/Signup.tsx`** — Wire to API

- Import `authService.register(name, email, password, storeName?)` from `services/auth.ts`
- On submit: call API, auto-login (store tokens + user), navigate to `/`
- Show field-level validation errors
- Keep store name field

#### **`Frontend/src/app/pages/Inventory.tsx`** — Wire to real data

- Replace mock product array with `useEffect` fetch from `GET /api/products`
- Add pagination controls (prev/next buttons or page numbers)
- Wire search input to `?search=` query param with debounce (300ms)
- Wire category filter dropdown to `GET /api/categories` and `?category=` param
- Status badges (Active/Inactive) map from `isActive` field
- Grid/list toggle can remain visual-only
- Add loading skeleton state (shadcn `Skeleton` is already available)
- Add error state with retry button

#### **`Frontend/src/app/pages/Dashboard.tsx`** — Wire basic KPIs

- Replace mock KPI numbers with `GET /api/products` count for total products
- Replace mock low stock count with real count from `GET /api/products?minStock=true`
- Charts and AI insights can stay with mock data for now (out of scope for Phase 1)

---

### 4.2 New Frontend Files to Create

#### **`Frontend/src/app/context/AuthContext.tsx`**

React context providing:
- `user: User | null`
- `isAuthenticated: boolean`
- `isLoading: boolean`
- `login(email, password): Promise<void>`
- `register(name, email, password, storeName?): Promise<void>`
- `logout(): void`
- `error: string | null`

Wrap `<App />` with `AuthProvider` in `main.tsx`.

#### **`Frontend/src/app/types/index.ts`**

```ts
export interface User {
  _id: string
  name: string
  email: string
  role: "admin" | "manager" | "cashier" | "warehouse" | "analyst"
  store?: Store
  isActive: boolean
}

export interface Store {
  _id: string
  name: string
  address?: string
  phone?: string
  gstin?: string
}

export interface Category {
  _id: string
  name: string
  description?: string
  parentCategory?: Category | string
  isActive: boolean
}

export interface Product {
  _id: string
  sku: string
  name: string
  category: Category | string
  description?: string
  buyingPrice: number
  sellingPrice: number
  mrp: number
  unit: "piece" | "kg" | "liter" | "pack" | "box"
  quantity: number
  minStock: number
  maxStock: number
  location?: string
  barcode?: string
  image?: string
  expiryDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pages: number
  total: number
}
```

#### **`Frontend/src/app/services/api.ts`** — Axios instance

```ts
// Create axios instance with baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api"
// Request interceptor: attach Authorization: Bearer <accessToken> if available
// Response interceptor: if 401, try refresh token flow, retry original request
// Export the instance
```

#### **`Frontend/src/app/services/auth.ts`**

```ts
// login(email, password) → POST /users/login → returns {user, accessToken}
// register(name, email, password, storeName?) → POST /users/register
// logout() → POST /users/logout
// getProfile() → GET /users/profile
// refreshToken() → POST /users/refresh
```

#### **`Frontend/src/app/services/products.ts`**

```ts
// getProducts(params: {search?, category?, page?, limit?, minStock?, isActive?}) → GET /products
// getProductById(id) → GET /products/:id
// createProduct(data) → POST /products
// updateProduct(id, data) → PUT /products/:id
// deleteProduct(id) → DELETE /products/:id
```

#### **`Frontend/src/app/services/categories.ts`**

```ts
// getCategories(params?: {isActive?}) → GET /categories
// getCategoryById(id) → GET /categories/:id
// createCategory(data) → POST /categories
// updateCategory(id, data) → PUT /categories/:id
// deleteCategory(id) → DELETE /categories/:id
```

#### **`Frontend/src/app/pages/Categories.tsx`** — Category management page

- Table list of categories with name, description, status badge
- "Add Category" button → modal/dialog with form (name, description, parent category dropdown)
- Row actions: Edit (modal), Deactivate (with confirmation)
- Subcategory support through `parentCategory` field (render as indented tree if needed)
- Breadcrumb: Settings > Categories or sidebar nav item

#### **`Frontend/src/app/pages/ProductForm.tsx`** — Create/Edit product form

- Two modes: Create (POST) and Edit (PUT)
- Fields: SKU (auto-generate button), Name, Category (dropdown from API), Description, Buying Price, Selling Price, MRP, Unit (dropdown), Quantity, Min Stock, Max Stock, Location, Barcode, Image URL, Expiry Date
- Frontend validation: required fields, price > 0, quantity >= 0
- On save: call API, navigate back to product list
- Form component using `react-hook-form` (already installed) and shadcn `Form` / `Input` / `Select`

Integration: Products page gets an "Add Product" button and each row gets an "Edit" button that navigates to or opens `<ProductForm />` as a dialog.

#### **`Frontend/src/app/hooks/useProducts.ts`**

```ts
// Custom hook wrapping products service
// Returns: { products, loading, error, page, pages, total, search, setSearch, setPage, refetch }
```

#### **`Frontend/src/app/hooks/useCategories.ts`**

```ts
// Custom hook wrapping categories service
// Returns: { categories, loading, error, refetch }
```

---

### 4.3 Frontend Data Flow

```
User Action → React Component → Service Function → api.ts (axios) → Express Backend
                                                                             ↓
React Component ← setState ← Service Function ← api.ts response ← Express JSON response
```

**Auth flow:**
```
Login page → auth.login() → POST /api/users/login
  → server returns {accessToken, user} + httpOnly refresh cookie
  → store accessToken in AuthContext (in-memory)
  → store user in AuthContext
  → navigate to Dashboard

On page refresh:
  → AuthContext initializes, calls POST /api/users/refresh (cookie sent automatically)
  → server returns new accessToken
  → then GET /api/users/profile for user data
  → if refresh fails → redirect to /login
```

---

## 5. Acceptance Criteria

### D1 — Auth Upgrade
- [ ] User can register with name, email, password, store name
- [ ] User can login and receives access token + refresh cookie
- [ ] Token refresh works transparently (frontend retries on 401)
- [ ] User can logout (cookie cleared, DB token removed)
- [ ] Role-based middleware blocks unauthorized access (test all 5 roles against admin-only endpoint)
- [ ] `/profile` returns current user with populated store
- [ ] Existing todo routes still work with new auth (regression)

### D2 — Store Model
- [ ] Store CRUD endpoints work (admin only)
- [ ] Registering creates or assigns a store to the user
- [ ] Store data appears in user profile response

### D3 — Category CRUD
- [ ] Admin & manager can create categories
- [ ] All roles can view categories
- [ ] Admin can soft-delete (deactivate) categories
- [ ] Subcategory support works (parentCategory ref)
- [ ] Category list filters by `isActive`
- [ ] Frontend category page lists all categories with status badges
- [ ] Create/edit modal works end-to-end

### D4 — Product CRUD
- [ ] Admin & manager can create products
- [ ] SKU is auto-generated if not provided
- [ ] All roles can view products (paginated)
- [ ] Search by name/sku works with regex
- [ ] Filter by category works
- [ ] Product list page is paginated
- [ ] Create/edit form validates required fields
- [ ] Soft-delete works (product disappears from active list)

### D5 — Inventory List Page
- [ ] Active product list loads from API on mount
- [ ] Search input filters results with debounce
- [ ] Pagination controls work
- [ ] Loading state shows skeleton
- [ ] Empty state shows helpful message
- [ ] Error state shows retry button

---

## 6. Out of Scope (Phase 2+)

- POS / Billing system
- Sale creation and stock deduction
- Invoice PDF generation
- Customer CRUD
- Supplier CRUD
- Purchase Orders
- Inventory logs, low stock alerts, expiry alerts
- Redis caching
- Elasticsearch
- Analytics dashboard (real data)
- ML predictions
- Barcode generation / scanning
- File upload (product images)

---

## 7. File Change Summary

### Backend — Modified
| File | Change |
|------|--------|
| `config.js` | Add JWT config |
| `server.js` | Register new route groups |
| `database/index.js` | Better connection handling |
| `models/userModel.js` | Add role, store, refreshToken, isActive |
| `utils/generateToken.js` | Dual-token system / replaced by authService |
| `middleware/authMiddleware.js` | Add `authorize()` export |
| `routes/userRoutes.js` | Add profile, refresh, list routes |
| `controllers/userController.js` | Add profile, refresh, list handlers |

### Backend — Created
| File | Purpose |
|------|---------|
| `models/storeModel.js` | Store schema |
| `models/categoryModel.js` | Category schema |
| `models/productModel.js` | Product schema |
| `services/authService.js` | Token generation, password helpers |
| `routes/categoryRoutes.js` | Category API routes |
| `controllers/categoryController.js` | Category CRUD handlers |
| `routes/productRoutes.js` | Product API routes |
| `controllers/productController.js` | Product CRUD handlers |
| `routes/storeRoutes.js` | Store API routes |
| `controllers/storeController.js` | Store CRUD handlers |

### Frontend — Modified
| File | Change |
|------|--------|
| `main.tsx` | Wrap App in AuthProvider |
| `app/App.tsx` | Use AuthContext for auth state |
| `app/components/Topbar.tsx` | Show real user name & store |
| `app/pages/Login.tsx` | Wire form to `auth.login()` |
| `app/pages/Signup.tsx` | Wire form to `auth.register()` |
| `app/pages/Inventory.tsx` | Replace mock data with real API fetch, pagination, search |
| `app/pages/Dashboard.tsx` | Wire basic KPIs to API |

### Frontend — Created
| File | Purpose |
|------|---------|
| `app/context/AuthContext.tsx` | Auth state provider |
| `app/types/index.ts` | Shared TypeScript types |
| `app/services/api.ts` | Axios instance with interceptors |
| `app/services/auth.ts` | Auth API calls |
| `app/services/products.ts` | Products API calls |
| `app/services/categories.ts` | Categories API calls |
| `app/hooks/useProducts.ts` | Products data hook |
| `app/hooks/useCategories.ts` | Categories data hook |
| `app/pages/Categories.tsx` | Category management page |
| `app/pages/ProductForm.tsx` | Create/Edit product form |

---

## 8. Environment Variables

### Backend `.env` additions

```ini
# .env
PORT=8080
NODE_ENV=development
JWT_SECRET=<your-secret-here>
DB_NAME=stockly
DB_HOST=127.0.0.1
DB_PORT=27017
DB_USER=
DB_USER_PWD=
CORS_URL=http://localhost:5173
```

### Frontend `.env` additions

```ini
VITE_API_URL=http://localhost:8080/api
```

---

## 9. Verification Plan

After implementation, verify by:

1. **Start backend**: `cd Backend && npm run dev`
2. **Start frontend**: `cd Frontend && pnpm dev`
3. **Manual test flow**:
   - Register a new user → auto-login → redirected to dashboard
   - Create a store (via API or registration)
   - Create a category → appears in list
   - Create a product → appears in inventory list
   - Edit product → changes reflected
   - Search products → filtered results
   - Logout → redirected to login
   - Login again → dashboard loads with persisted data
4. **Edge cases**:
   - Register with duplicate email → 400 error shown on form
   - Access /api/products without token → 401
   - Cashier tries DELETE /api/products/:id → 403
   - Search with no results → empty state
   - Page beyond available → empty page

---

## 10. Dependencies

- Backend: No new npm packages needed (express, mongoose, jsonwebtoken, bcryptjs, cookie-parser already installed)
- Frontend: No new npm packages needed (axios optional but cleaner — can use native fetch; all UI components already installed)
- MongoDB must be running locally on port 27017
