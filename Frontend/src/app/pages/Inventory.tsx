import { useState } from 'react';
import { Search, Filter, Plus, Grid3x3, List, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const products = [
  {
    id: 1,
    image: '📦',
    sku: 'PRD-001',
    name: 'Organic Milk 1L',
    category: 'Dairy',
    quantity: 156,
    supplier: 'Fresh Farms',
    buyPrice: '$2.50',
    sellPrice: '$5.00',
    expiry: '2026-06-15',
    status: 'in-stock',
  },
  {
    id: 2,
    image: '🍞',
    sku: 'PRD-002',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    quantity: 89,
    supplier: 'Artisan Bakery',
    buyPrice: '$1.50',
    sellPrice: '$3.00',
    expiry: '2026-05-20',
    status: 'in-stock',
  },
  {
    id: 3,
    image: '🥚',
    sku: 'PRD-003',
    name: 'Fresh Eggs 12pk',
    category: 'Dairy',
    quantity: 12,
    supplier: 'Farm Direct',
    buyPrice: '$2.00',
    sellPrice: '$4.00',
    expiry: '2026-05-25',
    status: 'low-stock',
  },
  {
    id: 4,
    image: '🍊',
    sku: 'PRD-004',
    name: 'Orange Juice 2L',
    category: 'Beverages',
    quantity: 0,
    supplier: 'Juice Co',
    buyPrice: '$3.50',
    sellPrice: '$7.00',
    expiry: '2026-06-30',
    status: 'out-of-stock',
  },
  {
    id: 5,
    image: '🍚',
    sku: 'PRD-005',
    name: 'Basmati Rice 5kg',
    category: 'Groceries',
    quantity: 234,
    supplier: 'Global Foods',
    buyPrice: '$8.00',
    sellPrice: '$15.00',
    expiry: '2027-01-01',
    status: 'in-stock',
  },
];

export function Inventory() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
            <CheckCircle className="w-3 h-3" />
            In Stock
          </span>
        );
      case 'low-stock':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">
            <AlertCircle className="w-3 h-3" />
            Low Stock
          </span>
        );
      case 'out-of-stock':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded-full">
            <XCircle className="w-3 h-3" />
            Out of Stock
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Manage and track your product inventory</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-emerald-gradient-from to-emerald-gradient-to text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">1,245</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">32</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-card border border-input rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <div className="flex bg-card border border-input rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary/10 text-primary' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : ''}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Buy Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Sell Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/30 transition-colors cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                        {product.image}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">Exp: {product.expiry}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{product.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{product.supplier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{product.buyPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{product.sellPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(product.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
