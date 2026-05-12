# Stockly — System Specification Document

> **Note**: The `problem_defined.md` mentions FastAPI/SQLAlchemy, but the existing backend is **Node.js Express + Mongoose**. Since MongoDB was chosen and the backend is already scaffolded, we continue with **Express + Mongoose** to avoid a rewrite.

---

## 1. Tech Stack (Finalized)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + Vite 6 + TypeScript | Already set up |
| UI | Tailwind CSS 4 + shadcn/ui + MUI | Already set up |
| Frontend PM | pnpm | Already configured |
| Backend | Node.js Express 4 | Already scaffolded |
| Database | MongoDB + Mongoose 8 | Chosen, already configured |
| Auth | JWT + bcryptjs | Already implemented |
| Cache | Redis | Industry standard |
| Search | Elasticsearch | Chosen for full-text search |
| ML Data Prep | CSV-based data warehouse exports | Historical data can be exported to CSV now and used later for offline ML model building |
| Frontend Hosting | Netlify | Chosen by user |
| Backend Hosting | Railway / Render (TBD on deploy) | Only if deployment needed |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Netlify)                 │
│  React + Vite + TypeScript + shadcn/ui + Tailwind   │
│                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │
│  │ Dash │ │ Inven│ │ POS  │ │ Cust │ │ Settings  │  │
│  │ board│ │ tory │ │      │ │Sup etc│ │          │  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (JSON)
                       ▼
┌─────────────────────────────────────────────────────┐
│              Backend (Express + Mongoose)            │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Routes   │→ │Controllers│→│ Models (Mongoose) │  │
│  └──────────┘  └──────────┘  └────────┬─────────┘  │
│                                        │             │
│  ┌──────────┐  ┌──────────┐            ▼             │
│  │Middleware│  │ Services │   ┌────────────────┐     │
│  │(auth,etc)│  │(utils)   │   │    MongoDB      │     │
│  └──────────┘  └──────────┘   └────────────────┘     │
│                                        │             │
│  ┌──────────┐  ┌──────────┐            ▼             │
│  │  Redis   │  │Elastic   │   ┌────────────────┐     │
│  │  Cache   │  │search    │   │ Data Warehouse  │     │
│  └──────────┘  └──────────┘   │ (Read replica /  │     │
│                               │  aggregated cols) │     │
│                               └────────┬─────────┘     │
│                                        │               │
│                               ┌────────▼─────────┐     │
│                               │   ML Service      │     │
│                               │(Python microserv.)│     │
│                               └──────────────────┘     │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
Frontend → REST API → Express Routes → Controllers → 
  Services → Mongoose Models → MongoDB
    ├── Redis (cache hot data)
    ├── Elasticsearch (search indexing)
    └── ETL Pipeline → CSV Warehouse Exports
```

---

## 3. Project Structure

### Backend (`Backend/`)

```
Backend/
├── server.js                  # Entry point
├── config.js                  # Environment config
├── .env.example
├── package.json
├── database/
│   └── index.js               # MongoDB connection
├── middleware/
│   ├── authMiddleware.js      # JWT verification
│   └── errorMiddleware.js     # Global error handler
├── models/
│   ├── userModel.js
│   ├── productModel.js
│   ├── categoryModel.js
│   ├── saleModel.js
│   ├── saleItemModel.js
│   ├── customerModel.js
│   ├── supplierModel.js
│   ├── purchaseOrderModel.js
│   ├── purchaseOrderItemModel.js
│   ├── inventoryLogModel.js
│   └── analytics/
│       ├── salesFact.js
│       └── inventoryFact.js
├── routes/
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── saleRoutes.js
│   ├── customerRoutes.js
│   ├── supplierRoutes.js
│   ├── purchaseOrderRoutes.js
│   ├── inventoryRoutes.js
│   ├── analyticsRoutes.js
│   └── searchRoutes.js
├── controllers/
│   ├── userController.js
│   ├── productController.js
│   ├── categoryController.js
│   ├── saleController.js
│   ├── customerController.js
│   ├── supplierController.js
│   ├── purchaseOrderController.js
│   ├── inventoryController.js
│   ├── analyticsController.js
│   └── searchController.js
├── services/
│   ├── authService.js         # JWT helpers, password hashing
│   ├── inventoryService.js    # Stock logic, low stock alerts
│   ├── billingService.js      # Invoice generation, GST calc
│   ├── analyticsService.js    # Aggregation pipelines
│   ├── cacheService.js        # Redis operations
│   ├── searchService.js       # Elasticsearch operations
│   ├── pdfService.js          # PDF invoice generation
│   └── notificationService.js # Alerts & notifications
├── utils/
│   ├── constants.js
│   ├── validators.js
│   └── helpers.js
├── etl/
│   ├── pipeline.js            # ETL orchestration
│   ├── transforms.js          # Data transformation
│   └── scheduler.js           # Cron/interval scheduling
├── exports/
│   └── warehouse/             # Generated CSV files for analytics / future ML
└── scripts/
    └── exportWarehouse.js     # Manual or scheduled CSV export entry point
```

### Frontend (`Frontend/src/`)

```
Frontend/src/
├── main.tsx                   # Entry point
├── app/
│   ├── App.tsx                # Routing & auth state
│   ├── components/
│   │   ├── MainLayout.tsx     # Layout wrapper
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── MobileNav.tsx
│   │   └── ui/                # shadcn components
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Inventory.tsx
│   │   ├── POS.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── AIForecasting.tsx
│   │   ├── Settings.tsx
│   │   ├── Customers.tsx      # To build
│   │   ├── Suppliers.tsx      # To build
│   │   ├── PurchaseOrders.tsx # To build
│   │   ├── Warehouse.tsx      # To build
│   │   ├── Analytics.tsx      # To build
│   │   ├── Reports.tsx        # To build
│   │   └── ComingSoon.tsx     # Placeholder
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useInventory.ts
│   ├── services/              # API client layer
│   │   ├── api.ts             # Axios/fetch instance
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── sales.ts
│   │   ├── customers.ts
│   │   └── ...
│   └── utils/
│       ├── formatters.ts      # Currency, date, etc
│       └── constants.ts
└── styles/
    ├── globals.css
    ├── theme.css
    └── tailwind.css
```

---

## 4. Database Schema (MongoDB — Mongoose)

### 4.1 Users & Roles

```
User {
  _id: ObjectId
  name: String
  email: String (unique, indexed)
  password: String (bcrypt hashed)
  role: enum['admin', 'manager', 'cashier', 'warehouse', 'analyst']
  storeId: ref->Store (for multi-store)
  isActive: Boolean
  refreshToken: String?
  createdAt: Date
  updatedAt: Date
}

Store {
  _id: ObjectId
  name: String
  address: String
  phone: String
  gstin: String?  # GST number
  createdAt: Date
}
```

### 4.2 Inventory

```
Category {
  _id: ObjectId
  name: String (unique)
  description: String
  image: String?
  parentCategory: ref->Category? (subcategories)
  isActive: Boolean
}

Product {
  _id: ObjectId
  sku: String (unique, indexed)
  name: String
  category: ref->Category
  description: String
  buyingPrice: Number
  sellingPrice: Number
  mrp: Number
  unit: enum['piece', 'kg', 'liter', 'pack', 'box']
  quantity: Number (current stock)
  minStock: Number (low stock threshold)
  maxStock: Number (overstock threshold)
  location: String? (warehouse shelf/bin)
  supplier: ref->Supplier
  barcode: String? (unique)
  image: String?
  expiryDate: Date?
  isActive: Boolean
  createdAt: Date
  updatedAt: Date
}

InventoryLog {
  _id: ObjectId
  product: ref->Product
  type: enum['purchase', 'sale', 'transfer', 'adjustment', 'expiry', 'return']
  quantity: Number (positive = in, negative = out)
  reference: String? (saleId, POId, etc)
  notes: String?
  performedBy: ref->User
  createdAt: Date
}
```

### 4.3 Billing

```
Sale {
  _id: ObjectId
  invoiceNo: String (unique, auto-generated)
  customer: ref->Customer?
  items: [SaleItem]
  subtotal: Number
  discountPercent: Number
  discountAmount: Number
  taxPercent: Number
  taxAmount: Number
  total: Number
  paymentMethod: enum['cash', 'upi', 'card', 'wallet', 'split']
  amountTendered: Number
  changeAmount: Number
  status: enum['completed', 'refunded', 'partially_refunded']
  cashier: ref->User
  store: ref->Store
  createdAt: Date
}

SaleItem {
  product: ref->Product
  name: String (snapshot)
  quantity: Number
  unitPrice: Number
  totalPrice: Number
}
```

### 4.4 Customers

```
Customer {
  _id: ObjectId
  name: String
  mobile: String (unique, indexed)
  email: String?
  address: String?
  gstin: String?
  loyaltyPoints: Number (default 0)
  totalPurchases: Number
  lastPurchaseDate: Date
  tags: [String]  # e.g. ['wholesale', 'regular']
  createdAt: Date
}
```

### 4.5 Suppliers

```
Supplier {
  _id: ObjectId
  name: String
  contactPerson: String?
  mobile: String
  email: String?
  address: String?
  gstin: String?
  performance: {
    avgDeliveryDays: Number
    qualityRating: Number (1-5)
    reliabilityScore: Number
    onTimeDeliveryRate: Number
  }
  isActive: Boolean
  createdAt: Date
}
```

### 4.6 Purchase Orders

```
PurchaseOrder {
  _id: ObjectId
  poNumber: String (unique)
  supplier: ref->Supplier
  items: [POItem]
  status: enum['draft', 'pending_approval', 'approved', 'ordered', 'received', 'cancelled']
  subtotal: Number
  taxAmount: Number
  total: Number
  expectedDeliveryDate: Date?
  receivedDate: Date?
  notes: String?
  createdBy: ref->User
  approvedBy: ref->User?
  createdAt: Date
  updatedAt: Date
}

POItem {
  product: ref->Product
  name: String (snapshot)
  quantity: Number
  unitPrice: Number
  totalPrice: Number
  receivedQuantity: Number (default 0)
}
```

### 4.7 Analytics / Warehouse Export Schema

```
sales_fact.csv
  date
  saleId
  invoiceNo
  productId
  productName
  categoryId
  categoryName
  storeId
  storeName
  customerId
  customerName
  quantity
  unitPrice
  totalAmount
  costPrice
  profit
  paymentMethod
  cashierId

inventory_fact.csv
  date
  productId
  productName
  categoryId
  categoryName
  openingStock
  closingStock
  quantitySold
  quantityPurchased
  stockValue

customer_snapshot.csv
  exportDate
  customerId
  name
  mobile
  email
  loyaltyPoints
  totalPurchases
  lastPurchaseDate
  tags
```

---

## 5. API Route Design

### Auth (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | User signup |
| POST | `/login` | No | User login → JWT |
| POST | `/logout` | Yes | Invalidate token |
| GET | `/profile` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update profile |
| GET | `/` | Admin | List all users |

### Inventory (`/api/products`, `/api/categories`, `/api/inventory`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | Yes | List products (search, filter, paginate) |
| POST | `/products` | Yes | Create product |
| GET | `/products/:id` | Yes | Get product detail |
| PUT | `/products/:id` | Yes | Update product |
| DELETE | `/products/:id` | Admin | Soft-delete product |
| GET | `/categories` | Yes | List categories |
| POST | `/categories` | Yes | Create category |
| GET | `/inventory/logs` | Yes | Inventory change log |
| GET | `/inventory/low-stock` | Yes | Low stock alerts |
| GET | `/inventory/expiring` | Yes | Expiry alerts |

### Billing (`/api/sales`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/sales` | Cashier | Create sale + auto-deduct stock |
| GET | `/sales` | Yes | List sales (filter by date, cashier) |
| GET | `/sales/:id` | Yes | Get invoice detail |
| POST | `/sales/:id/refund` | Manager | Process refund |
| GET | `/sales/invoice/:invoiceNo` | Yes | Get invoice by number |
| GET | `/sales/pdf/:id` | Yes | Download invoice PDF |

### Customers (`/api/customers`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/customers` | Yes | List customers (search by name/mobile) |
| POST | `/customers` | Yes | Create customer |
| GET | `/customers/:id` | Yes | Customer detail + history |
| PUT | `/customers/:id` | Yes | Update customer |
| GET | `/customers/:id/purchase-history` | Yes | Customer purchase history |

### Suppliers (`/api/suppliers`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/suppliers` | Yes | List suppliers |
| POST | `/suppliers` | Yes | Create supplier |
| GET | `/suppliers/:id` | Yes | Supplier detail + metrics |
| PUT | `/suppliers/:id` | Yes | Update supplier |
| GET | `/suppliers/:id/performance` | Yes | Supplier performance score |

### Purchase Orders (`/api/purchase-orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/purchase-orders` | Yes | List POs |
| POST | `/purchase-orders` | Manager | Create PO |
| GET | `/purchase-orders/:id` | Yes | PO detail |
| PUT | `/purchase-orders/:id` | Manager | Update PO |
| PATCH | `/purchase-orders/:id/approve` | Admin | Approve PO |
| PATCH | `/purchase-orders/:id/receive` | Warehouse | Mark as received |
| GET | `/purchase-orders/recommendations` | Yes | Auto-refill suggestions |

### Analytics (`/api/analytics`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/dashboard` | Yes | Dashboard metrics |
| GET | `/analytics/revenue` | Analyst | Revenue breakdown |
| GET | `/analytics/categories` | Analyst | Category-wise sales |
| GET | `/analytics/best-selling` | Yes | Best selling products |
| GET | `/analytics/peak-hours` | Analyst | Peak shopping hours |
| GET | `/analytics/supplier-performance` | Analyst | Supplier comparison |

### Search (`/api/search`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search/products?q=` | Yes | Full-text product search |
| GET | `/search/customers?q=` | Yes | Customer search |

---

## 6. Redis Cache Strategy

```
Cache Layers:
├── session:${token} → User data (TTL: 24h)
├── product:${id} → Product object (TTL: 1h, invalidate on update)
├── dashboard:${storeId} → Aggregated metrics (TTL: 5min)
├── analytics:${query_hash} → Analytics results (TTL: 15min)
└── rate_limit:${ip} → Rate limit counter (TTL: 1min)
```

---

## 7. Elasticsearch Indexes

```
Index: products
  Fields: name, sku, barcode, description, categoryName
  - Autocomplete on name, sku
  - Fuzzy search for misspellings

Index: customers
  Fields: name, mobile, email
  - Search by mobile partial match
```

---

## 8. Data Warehouse & ETL

### ETL Pipeline Design

```
Trigger: cron job (every 15min) or event-driven
├── Extract:
│   ├── Sales collection → sales_fact rows
│   ├── InventoryLog / Product collections → inventory_fact rows
│   └── Customer collection → customer snapshot rows
├── Transform:
│   ├── Flatten nested objects
│   ├── Calculate derived fields (profit = total - cost)
│   ├── Enrich with dimension lookups
│   └── Aggregate by hour/day
└── Load:
    ├── Write `sales_fact.csv`
    ├── Write `inventory_fact.csv`
    └── Write `customer_snapshot.csv`
```

### CSV Warehouse Strategy

```
CSV exports are the long-term historical warehouse for future ML work:
├── Backend generates flat CSV files from operational MongoDB data
├── Files are stored in a predictable export directory
├── Exports can be generated on schedule or manually
├── These CSV files can later be imported into Python notebooks / scripts
└── No prediction service is required in the current project scope
```

---

## 9. Build Phases (Solo Developer Priority)

### Phase 1: Core Foundation (Weeks 1-2)
- [ ] Complete User auth (login/signup/logout + role-based middleware)
- [ ] Store model + multi-store setup
- [ ] Category CRUD (backend + frontend)
- [ ] Product CRUD (backend + frontend)
- [ ] Basic Inventory list page with search

### Phase 2: Transactional Core (Weeks 3-4)
- [ ] POS/Billing system (create sale, auto-deduct stock)
- [ ] Sale list + invoice detail page
- [ ] PDF invoice generation
- [ ] Customer CRUD (backend + frontend)
- [ ] Link sales to customers

### Phase 3: Extended Features (Weeks 5-6)
- [ ] Supplier CRUD (backend + frontend)
- [ ] Purchase Order system (create, approve, receive)
- [ ] Auto-refill recommendations
- [ ] Inventory logs & stock transfer
- [ ] Expiry & low stock alerts
- [ ] Barcode/QR generation

### Phase 4: Analytics & Dashboard (Weeks 7-8)
- [ ] Dashboard API (daily/weekly/monthly metrics)
- [ ] Dashboard frontend widgets
- [ ] Revenue & profit charts
- [ ] Category-wise & peak-hours analytics
- [ ] Best-selling products

### Phase 5: Infrastructure (Weeks 9-10)
- [ ] Redis caching layer
- [ ] Elasticsearch indexing + full-text search
- [ ] ETL pipeline to CSV warehouse exports
- [ ] Frontend search integration

### Phase 6: Data Export Readiness (Weeks 11-12)
- [ ] Finalize CSV warehouse schemas for sales, inventory, and customers
- [ ] Add scheduled/manual export commands
- [ ] Document CSV usage for future offline ML experiments
- [ ] Keep AI Forecasting page as placeholder until a real model exists

---

## 10. Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Backend framework | Express (not FastAPI) | Already scaffolded, MongoDB native |
| DB ODM | Mongoose | Already set up, works with MongoDB |
| Refunds | Soft (reverse sale + create inventory log) | Auditable trail |
| Stock updates | Event-driven on sale creation | Real-time accuracy |
| Multi-store | Store ref on User + Product | Scalable from day one |
| Invoice numbering | Auto-increment per store (YYMMDD-XXXX) | Human-readable |
| Auth tokens | Access (15min) + Refresh (7d) | Security best practice |
| ML readiness | CSV warehouse exports | Keeps the app simple now and preserves training data for future offline model work |

---

## 11. Questions Still Open

- [ ] **Deployment**: Backend hosting only if needed. No decision yet.
- [ ] **Thermal printing**: Requires Electron or browser print API. Research needed in POS phase.
- [ ] **Future ML workflow**: Decide later how CSV exports will be consumed for experiments or training.
- [ ] **File storage**: Product images — local upload vs cloud (Cloudinary/S3). TBD.
