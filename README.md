
<h1 align="center">
  <br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="">
    <img src="" alt="ShelfIQ" width="200">
  </picture>
  <br>
  Stockly — ShelfIQ
  <br>
</h1>

<h4 align="center">
  A modern, cloud-based SaaS Inventory & Business Intelligence Platform for supermarkets, grocery stores, and retail businesses.
</h4>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React 18">
  <img src="https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white" alt="Express 4">
  <img src="https://img.shields.io/badge/MongoDB-8-MongoDB?logo=mongodb&logoColor=green" alt="MongoDB">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/Status-Development-yellow" alt="Status: Active Development">
</p>

<p align="center">
  <a href="#key-features">Features</a> •
  <a href="#how-its-different">How It's Different</a> •
  <a href="#business-value">Business Value</a> •
  <a href="#folder-structure">Structure</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-overview">API</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## What is Stockly (ShelfIQ)?

**Stockly** (branded as **ShelfIQ**) is a lightweight modern ERP designed specifically for small-to-medium supermarkets, grocery stores, mini marts, retail shops, pharmacy chains, and wholesale businesses. It replaces the need for multiple disconnected tools by combining inventory management, POS billing, customer and supplier management, purchase orders, analytics, and AI-powered forecasting into a single, unified platform.

The system is built with a **mobile-first, responsive UI**, supports **multi-store operations**, and comes with **role-based access control** for real-world business hierarchies.

---

## Key Features

### POS & Billing
- Full point-of-sale interface with product grid, category filtering, and search
- Cart management with quantity adjustment, discounts, and tax
- Multiple payment methods: cash, card, UPI, wallet, split payment
- Auto-calculate change and tendered amount
- Automatic stock deduction on sale
- Automatic loyalty points accumulation for customers
- Professional invoice PDF generation (server-side, no external library)

### Inventory Management
- Full product CRUD with auto SKU generation
- Category hierarchy with subcategory support
- Min/max stock threshold monitoring
- Real-time low stock alerts
- Stock movement audit trail (purchase, sale, transfer, adjustment, expiry, return)
- Manual stock adjustment with logging
- Barcode and QR code display

### Purchase Orders
- Full PO lifecycle: draft → pending approval → approved → ordered → received → cancelled
- Auto-refill recommendations for products below minimum stock threshold
- Approve and receive workflows with automatic stock updates

### Customer Management
- Customer database with mobile dedup
- Purchase history tracking
- Loyalty points system (auto-accumulated on purchase)
- Customer tagging for segmentation

### Supplier Management
- Supplier database with contact management
- Performance metrics: average delivery days, quality rating, reliability score, on-time delivery rate

### Analytics & Dashboard
- Real-time KPI cards: daily/weekly/monthly revenue, profit margin, total products, low stock count
- Revenue trend chart (7-day) with ₹ Indian Rupee formatting
- Category-wise sales distribution (pie chart)
- Best-selling products ranking
- Peak shopping hours analysis
- All computed via MongoDB aggregation pipelines

### ML Dataset Generation
- Every sale automatically recorded into a **DailyRecord** with rich context:
  - Date, day name, weekend flag, season detection, Indian festival detection
  - Real-time weather data via **WeatherAPI.com** (condition, temperature, humidity, wind speed)
  - Per-product quantity & revenue breakdown, payment method split
- **One-click CSV export** from the Dashboard — generated on-demand, never stored on disk
- CSV structure designed for ML model training (tabular format with feature columns)
- Festival calendar includes 25+ Indian festivals (Diwali, Holi, Dussehra, Pongal, Christmas, etc.)

### AI Forecasting (UI Ready)
- Sales forecast chart with confidence intervals
- Product-level demand forecasting
- AI-generated insights: weather impact, seasonal trends, anomaly detection
- Mock data layer — ready to connect to real ML backend

### Authentication & Security
- JWT-based authentication (access token + httpOnly refresh cookie)
- Role-based access control: Admin, Manager, Cashier, Warehouse Staff, Analyst
- Automatic token refresh via axios interceptor
- Secure password hashing with bcryptjs

### Multi-Store Support
- Manage multiple store locations under a single account
- Each store has isolated inventory, sales, and staff

### Settings (UI Ready)
- Account settings, store configuration, notifications
- Billing & subscription, appearance (dark/light mode), integrations

---

## How It's Different

| Aspect | Traditional ERP | Stockly (ShelfIQ) |
|---|---|---|
| **Target** | Large enterprises | Small-to-medium retail businesses |
| **Deployment** | On-premise, heavy installation | Cloud SaaS, browser-based |
| **Cost** | High license fees + maintenance | Subscription-based, affordable |
| **UI/UX** | Cluttered, legacy design | Modern, mobile-first, dark/light mode |
| **Setup Time** | Weeks to months | Minutes (register and start billing) |
| **AI** | Add-on module at extra cost | Built-in AI forecasting architecture |
| **Integrations** | Proprietary, closed | REST API-first, extensible |
| **Inventory** | Complex, over-engineered | Simple, retail-focused |
| **Learning Curve** | Steep training required | Intuitive, cashier-friendly POS |

---

## Business Value

### For Supermarket Owners
- **Replace 3-5 separate tools** (billing software, inventory tracker, customer CRM, supplier ledger, spreadsheet reporting) with one platform
- **Reduce stockouts** with auto-refill recommendations that detect low-stock products and generate purchase suggestions — saving hours of manual shelf-checking
- **Increase sales** with loyalty points that encourage repeat customers
- **Make data-driven decisions** with real-time analytics on what's selling, when, and at what margin

### For Scaling Businesses
- **Multi-store ready** from day one — add new locations without new infrastructure
- **Role-based access** means you can hire cashiers, warehouse staff, and managers with appropriate permissions
- **Cloud-based** — access your business data from any device, anywhere
- **API-first architecture** makes it easy to integrate with existing or future tools

### For Developers & Implementers
- **Modern stack** (React + Express + MongoDB) with clean separation of concerns
- **Full REST API** — every feature has a documented backend endpoint
- **TypeScript frontend** with reusable hooks and service layer
- **shadcn/ui components** — consistent, customizable design system
- **JWT auth with refresh tokens** — production-ready security pattern

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** (ES Modules) | Runtime |
| **Express 4** | Web framework |
| **MongoDB + Mongoose 8** | Database & ODM |
| **JWT + bcryptjs** | Authentication |
| **httpOnly Cookies** | Refresh token storage |
| **Nodemon** | Development hot reload |
| **WeatherAPI.com** | Real-time & historical weather data per sale |
| **Native fetch (Node 24)** | HTTP client for weather API calls |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite 6** | Build tool |
| **Tailwind CSS 4** | Styling |
| **shadcn/ui** (Radix primitives) | Component library |
| **Recharts** | Charts & analytics |
| **Axios** | HTTP client with JWT interceptor |
| **react-hook-form** | Form management |
| **Lucide React** | Icons |
| **MUI Icons** | Additional icons |
| **Sonner** | Toast notifications |
| **date-fns** | Date utilities |
| **next-themes** | Dark/light mode |

---

## Folder Structure

```
Stockly/
│
├── Backend/                          # Express API server
│   ├── server.js                     # Entry point
│   ├── config.js                     # Environment configuration
│   ├── package.json
│   ├── .env.example                  # Environment template
│   ├── database/
│   │   └── index.js                  # MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT protect + role guard
│   │   └── errorMiddleware.js        # Global error handler
│   ├── models/                       # Mongoose schemas
│   │   ├── userModel.js
│   │   ├── storeModel.js
│   │   ├── categoryModel.js
│   │   ├── productModel.js
│   │   ├── customerModel.js
│   │   ├── supplierModel.js
│   │   ├── saleModel.js
│   │   ├── purchaseOrderModel.js
│   │   ├── inventoryLogModel.js
│   │   └── todoModel.js
│   ├── controllers/                  # Route handlers
│   │   ├── userController.js
│   │   ├── storeController.js
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   ├── customerController.js
│   │   ├── saleController.js
│   │   ├── supplierController.js
│   │   ├── purchaseOrderController.js
│   │   ├── inventoryController.js
│   │   ├── analyticsController.js
│   │   └── todoController.js
│   ├── routes/                       # Express route definitions
│   │   ├── userRoutes.js
│   │   ├── storeRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── productRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── saleRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── purchaseOrderRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── todoRoutes.js
│   ├── services/                     # Business logic layer
│   │   ├── authService.js            # JWT, password hashing, cookies
│   │   ├── billingService.js         # Invoice generation, stock deduction
│   │   └── pdfService.js             # Raw PDF invoice generation
│   ├── scripts/
│   │   └── seedData.js               # Database seeder
│   └── utils/
│       └── generateToken.js
│
├── Frontend/                         # React SPA
│   ├── index.html                    # HTML entry
│   ├── package.json
│   ├── vite.config.ts
│   ├── postcss.config.mjs
│   └── src/
│       ├── main.tsx                  # React entry point
│       ├── styles/                   # CSS (Tailwind, theme, fonts)
│       ├── app/
│       │   ├── App.tsx               # Router + auth gate
│       │   ├── types/index.ts        # TypeScript interfaces
│       │   ├── context/
│       │   │   └── AuthContext.tsx    # Auth state management
│       │   ├── services/             # API call layer (10 modules)
│       │   ├── components/           # Reusable components
│       │   │   ├── MainLayout.tsx    # App shell (sidebar + topbar)
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Topbar.tsx
│       │   │   ├── MobileNav.tsx
│       │   │   └── ui/               # 40+ shadcn/ui components
│       │   └── pages/                # Page components
│       │       ├── Login.tsx
│       │       ├── Signup.tsx
│       │       ├── Dashboard.tsx
│       │       ├── Inventory.tsx
│       │       ├── Categories.tsx
│       │       ├── ProductForm.tsx
│       │       ├── POS.tsx
│       │       ├── Sales.tsx
│       │       ├── SaleDetail.tsx
│       │       ├── Customers.tsx
│       │       ├── Suppliers.tsx
│       │       ├── PurchaseOrders.tsx
│       │       ├── InventoryLogs.tsx
│       │       ├── Analytics.tsx
│       │       ├── AIForecasting.tsx
│       │       ├── Settings.tsx
│       │       └── ComingSoon.tsx
│       └── hooks/                    # Custom React hooks
│           ├── useProducts.ts
│           └── useCategories.ts
│
├── Specs/                            # Phase specifications
├── plans/                            # Incremental development plans
├── .opencode/                        # AI agent configurations
├── graphify-out/                     # Knowledge graph (dev tooling)
├── AGENTS.md                         # Development workflow guide
├── problem_defined.md                # Full product vision document
└── spec_doc.md                       # System specification
```

---

## API Overview

The backend exposes a full REST API at `/api/`. All protected routes require a valid JWT access token (sent automatically by the frontend axios instance).

| Endpoint | Methods | Auth | Description |
|---|---|---|---|
| `/api/users` | POST, GET | Register: public; List: admin | User registration, listing, profile, login, logout, refresh |
| `/api/stores` | GET, POST, PUT | Admin | Multi-store CRUD |
| `/api/categories` | GET, POST, PUT, DELETE | Admin/Manager | Category CRUD with subcategories |
| `/api/products` | GET, POST, PUT, DELETE | Admin/Manager/Cashier | Product CRUD with search, pagination, filters |
| `/api/customers` | GET, POST, PUT, DELETE | Admin/Manager/Cashier | Customer CRUD with purchase history |
| `/api/suppliers` | GET, POST, PUT, DELETE | Admin/Manager | Supplier CRUD with performance metrics |
| `/api/sales` | GET, POST | Admin/Manager/Cashier | Create sale, list sales, invoice detail, PDF download |
| `/api/purchase-orders` | GET, POST, PUT | Admin/Manager | Full PO workflow + auto-refill recommendations |
| `/api/inventory` | GET, POST | Admin/Manager/Warehouse | Stock logs, low stock alerts, manual adjustments |
| `/api/analytics` | GET | Admin/Manager/Analyst | Dashboard KPIs, revenue chart, category sales, peak hours |
| `/api/analytics/export-dataset` | GET | Admin/Manager | Download ML training dataset as CSV (daily records with weather, festival, season context) |

---

## Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** (for backend) + **pnpm** (for frontend — install via `npm install -g pnpm`)
- **MongoDB** running locally on port `27017` (or configure via `.env`)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/stockly.git
cd stockly

# Backend
cd Backend
cp .env.example .env        # Edit database URI / JWT secrets as needed
npm install

# Frontend
cd ../Frontend
pnpm install
```

### 2. Configure Environment

Edit `Backend/.env`:
```
PORT=8080
MONGO_URI=mongodb://localhost:27017/stockly
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# WeatherAPI.com (free tier: 1M calls/month)
# Sign up at https://www.weatherapi.com to get your API key
WEATHER_API_KEY=your_weatherapi_key_here
WEATHER_CITY=Marathahalli,Bengaluru
WEATHER_COUNTRY_CODE=IN
```

> **Note:** Without a WeatherAPI key, the system uses placeholder weather data (30°C, "Unknown" condition) so the ML dataset pipeline still works without any external API. Set your key later when ready.

### 3. Run

```bash
# Terminal 1: Backend
cd Backend
npm run dev

# Terminal 2: Frontend
cd Frontend
pnpm dev
```

The app will be available at `http://localhost:5173`.

### 4. Seed Sample Data (Optional)

```bash
cd Backend
node scripts/seedData.js
```

This creates:
- **Store:** StockUp Supermarket
- **Admin:** admin@stockup.com / `password123`
- **Cashier:** cashier@stockup.com / `password123`
- **Suppliers:** 3 sample supplier records
- **Categories:** 5 product categories
- **Products:** 5 sample products
- **Sales:** ~21-35 sample transactions over 7 days — enough to see the dashboard come alive

---

## Roadmap

### Phase 1 — Core Foundation (Current: ~60% Complete)
- [x] Authentication & role-based access
- [x] Product & category management
- [x] POS / Billing with invoice PDF
- [x] Customer & supplier management
- [x] Purchase order workflow + auto-refill
- [x] Inventory tracking & audit logs
- [x] Analytics dashboard (revenue, best-sellers, peak hours)
- [ ] Refund/return processing
- [ ] Barcode scanner integration

### Phase 2 — Performance & Scale
- [ ] Redis caching layer for high-throughput POS
- [ ] Elasticsearch full-text search across products/customers
- [ ] Pagination optimization for 100k+ product catalogs

### Phase 3 — Intelligence
- [x] ML training dataset CSV export (daily records with weather, festival, seasonal context)
- [ ] Real ML sales prediction service
- [ ] Automated purchase order generation based on demand forecast
- [ ] Anomaly detection (unusual sales patterns, theft detection)
- [ ] Supplier performance scoring engine

### Phase 4 — Enterprise
- [ ] OAuth (Google/Microsoft sign-in)
- [x] ML dataset CSV export
- [ ] CSV/Excel bulk import/export
- [ ] ETL pipeline + data warehouse
- [ ] Thermal printer support
- [ ] GST-specific invoice formatting
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync

---

## Contributing

Contributions are welcome! This project follows a structured feature workflow:

1. Create a feature branch from `main`: `features/<kebab-case-summary>`
2. Run the planner to design the approach
3. Follow TDD practices
4. Open a pull request with a clear description of changes

The project includes 14 custom AI agent definitions (in `.opencode/agents/`) that can assist with planning, code review, testing, and refactoring.

---

## License

This project is currently in development. License to be determined.

---

## Acknowledgments

Built with ❤️ for small and medium retail businesses that deserve modern, affordable technology.
