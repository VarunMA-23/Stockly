import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { getProducts } from '../services/products';
import { Skeleton } from '../components/ui/skeleton';

const kpiData = [
  {
    title: 'Daily Revenue',
    value: '$45,231',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'emerald',
  },
  {
    title: 'Net Profit',
    value: '$12,405',
    change: '+8.2%',
    trend: 'up',
    icon: TrendingUp,
    color: 'blue',
  },
  {
    title: 'Inventory Value',
    value: '$328,905',
    change: '-2.4%',
    trend: 'down',
    icon: Package,
    color: 'purple',
  },
  {
    title: 'Orders Today',
    value: '1,429',
    change: '+18.7%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'orange',
  },
  {
    title: 'Sales Growth',
    value: '23.8%',
    change: '+4.1%',
    trend: 'up',
    icon: TrendingUp,
    color: 'pink',
  },
  {
    title: 'Low Stock Alerts',
    value: '24',
    change: '+6',
    trend: 'up',
    icon: AlertTriangle,
    color: 'red',
  },
];

const revenueData = [
  { name: 'Mon', revenue: 4200, profit: 1200 },
  { name: 'Tue', revenue: 5100, profit: 1500 },
  { name: 'Wed', revenue: 4800, profit: 1300 },
  { name: 'Thu', revenue: 6200, profit: 1800 },
  { name: 'Fri', revenue: 7500, profit: 2200 },
  { name: 'Sat', revenue: 8900, profit: 2600 },
  { name: 'Sun', revenue: 8100, profit: 2400 },
];

const categoryData = [
  { name: 'Groceries', value: 35, color: '#10b981' },
  { name: 'Dairy', value: 20, color: '#3b82f6' },
  { name: 'Beverages', value: 18, color: '#8b5cf6' },
  { name: 'Snacks', value: 15, color: '#f59e0b' },
  { name: 'Others', value: 12, color: '#ec4899' },
];

const topProducts = [
  { name: 'Organic Milk 1L', sales: 342, revenue: '$1,710', trend: 'up', change: '+12%' },
  { name: 'Whole Wheat Bread', sales: 289, revenue: '$867', trend: 'up', change: '+8%' },
  { name: 'Fresh Eggs 12pk', sales: 256, revenue: '$1,024', trend: 'down', change: '-3%' },
  { name: 'Orange Juice 2L', sales: 234, revenue: '$1,638', trend: 'up', change: '+15%' },
  { name: 'Greek Yogurt', sales: 198, revenue: '$990', trend: 'up', change: '+5%' },
];

const alerts = [
  {
    product: 'Organic Bananas',
    status: 'Low Stock',
    quantity: 24,
    type: 'warning',
  },
  {
    product: 'Almond Milk',
    status: 'Out of Stock',
    quantity: 0,
    type: 'danger',
  },
  {
    product: 'Brown Rice',
    status: 'Reorder Soon',
    quantity: 45,
    type: 'info',
  },
  {
    product: 'Tomato Sauce',
    status: 'Low Stock',
    quantity: 18,
    type: 'warning',
  },
];

const aiInsights = [
  {
    icon: '🥛',
    title: 'Milk sales may rise 18% next week',
    description: 'Based on seasonal patterns and weather forecast',
    confidence: '95%',
  },
  {
    icon: '🍚',
    title: 'Rice stock will run out in 4 days',
    description: 'Current consumption rate: 125 units/day',
    confidence: '92%',
  },
  {
    icon: '🍫',
    title: 'Snacks perform best after 6 PM',
    description: 'Consider promotional displays during peak hours',
    confidence: '88%',
  },
];

export function Dashboard() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const loadKpis = async () => {
      try {
        const [productsResponse, lowStockResponse] = await Promise.all([
          getProducts({ page: 1, limit: 1, isActive: true }),
          getProducts({ page: 1, limit: 1, minStock: true, isActive: true }),
        ]);

        if (!active) {
          return;
        }

        setProductCount(productsResponse.total);
        setLowStockCount(lowStockResponse.total);
      } catch {
        if (!active) {
          return;
        }

        setProductCount(null);
        setLowStockCount(null);
      }
    };

    loadKpis();

    return () => {
      active = false;
    };
  }, []);

  const resolvedKpiData = useMemo(
    () =>
      kpiData.map((kpi) => {
        if (kpi.title === 'Inventory Value') {
          return {
            ...kpi,
            value: productCount === null ? '—' : String(productCount),
            title: 'Total Products',
          };
        }

        if (kpi.title === 'Low Stock Alerts') {
          return {
            ...kpi,
            value: lowStockCount === null ? '—' : String(lowStockCount),
            change: lowStockCount === null ? 'Live' : `${lowStockCount}`,
          };
        }

        return kpi;
      }),
    [lowStockCount, productCount]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {resolvedKpiData.map((kpi, index) => (
          <div
            key={index}
            className="p-4 bg-card border border-border rounded-xl hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg bg-${kpi.color}-500/10 flex items-center justify-center`}
              >
                <kpi.icon className={`w-5 h-5 text-${kpi.color}-500`} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  kpi.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}
              >
                {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {(kpi.title === 'Total Products' && productCount === null) ||
              (kpi.title === 'Low Stock Alerts' && lowStockCount === null) ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                kpi.value
              )}
            </h3>
            <p className="text-sm text-muted-foreground">{kpi.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 p-6 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Revenue Overview</h2>
              <p className="text-sm text-muted-foreground">Last 7 days performance</p>
            </div>
            <select className="px-3 py-1.5 text-sm bg-background border border-input rounded-lg">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold mb-6">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span>{category.name}</span>
                </div>
                <span className="font-medium">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-gradient-from to-emerald-gradient-to flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.revenue}</p>
                  <p
                    className={`text-xs ${
                      product.trend === 'up' ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {product.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Inventory Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  alert.type === 'danger'
                    ? 'bg-destructive/5 border-destructive/20'
                    : alert.type === 'warning'
                    ? 'bg-warning/5 border-warning/20'
                    : 'bg-info/5 border-info/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{alert.product}</h4>
                    <p className="text-sm text-muted-foreground">Quantity: {alert.quantity}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.type === 'danger'
                        ? 'bg-destructive text-white'
                        : alert.type === 'warning'
                        ? 'bg-warning text-white'
                        : 'bg-info text-white'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="p-6 bg-gradient-to-br from-emerald-gradient-from/5 to-emerald-gradient-to/5 border border-primary/20 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-gradient-from to-emerald-gradient-to flex items-center justify-center">
            <span className="text-white">✨</span>
          </div>
          <h2 className="text-lg font-semibold">AI-Powered Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight, index) => (
            <div key={index} className="p-4 bg-card rounded-lg border border-border">
              <div className="text-2xl mb-2">{insight.icon}</div>
              <h3 className="font-semibold mb-1">{insight.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Confidence</span>
                <span className="text-xs font-medium text-primary">{insight.confidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
