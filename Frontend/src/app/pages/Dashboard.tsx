import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Package,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  List,
  FileDown,
} from 'lucide-react';
import {
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
} from 'recharts';
import { useEffect, useState } from 'react';
import {
  getDashboardMetrics,
  getRevenueReport,
  getCategorySales,
  getBestSellingProducts,
  DashboardMetrics,
  RevenueDataPoint,
  CategoryDataPoint,
  TopProductDataPoint,
} from '../services/analytics';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { formatCurrency } from '../utils/formatters';
import { downloadDatasetCsv } from '../services/analytics';

// Fallback AI Insights matching historical SRE patterns
const aiInsights = [
  {
    icon: '🥛',
    title: 'Perishable products sales rising',
    description: 'Fresh dairy and groceries demand is up 15% this week.',
    confidence: '95%',
  },
  {
    icon: '🍚',
    title: 'Reorder suggestion for low stock items',
    description: 'Average SRE refill recommendation lists 8 items needing PO drafts.',
    confidence: '92%',
  },
  {
    icon: '🍫',
    title: 'Peak transaction hours detected',
    description: 'POS sales volume spikes between 4 PM and 8 PM daily.',
    confidence: '88%',
  },
];

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductDataPoint[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, revenueRes, categoryRes, topProductsRes] = await Promise.all([
        getDashboardMetrics(),
        getRevenueReport(),
        getCategorySales(),
        getBestSellingProducts(),
      ]);

      setMetrics(metricsRes);
      setRevenueData(revenueRes);
      setCategoryData(categoryRes);
      setTopProducts(topProductsRes);
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err);
      setError('Unable to load dashboard analytics data. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [downloadingDataset, setDownloadingDataset] = useState(false);

  const handleDownloadDataset = async () => {
    setDownloadingDataset(true);
    try {
      const blob = await downloadDatasetCsv();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ml-dataset-${new Date().toISOString().split("T")[0]}.csv`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download dataset:", err);
    } finally {
      setDownloadingDataset(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80 mt-1" />
        </div>

        {/* KPI Cards Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 bg-card border border-border rounded-xl space-y-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        {/* Charts Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 bg-card border border-border rounded-xl">
            <Skeleton className="h-6 w-40 mb-6" />
            <Skeleton className="h-[300px] w-full" />
          </div>
          <div className="p-6 bg-card border border-border rounded-xl">
            <Skeleton className="h-6 w-40 mb-6" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time store metrics and operations tracker.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="mb-4 text-sm text-destructive">{error}</p>
          <Button onClick={loadData}>Retry</Button>
        </div>
      </div>
    );
  }

  // Build KPI card display definitions from live metrics
  const kpis = [
    {
      title: 'Daily Revenue',
      value: formatCurrency(metrics?.dailyRevenue || 0),
      change: metrics?.salesGrowth !== undefined ? `${metrics.salesGrowth >= 0 ? '+' : ''}${metrics.salesGrowth}%` : '0%',
      trend: (metrics?.salesGrowth || 0) >= 0 ? 'up' : 'down',
      icon: IndianRupee,
      color: 'emerald',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(metrics?.dailyProfit || 0),
      change: 'Live',
      trend: 'up',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(metrics?.inventoryValue || 0),
      change: 'Valuation',
      trend: 'up',
      icon: Package,
      color: 'purple',
    },
    {
      title: 'Orders Today',
      value: String(metrics?.ordersToday || 0),
      change: 'Transactions',
      trend: 'up',
      icon: ShoppingCart,
      color: 'orange',
    },
    {
      title: 'Total Products',
      value: String(metrics?.totalProducts || 0),
      change: 'Active SKUs',
      trend: 'up',
      icon: List,
      color: 'pink',
    },
    {
      title: 'Low Stock Alerts',
      value: String(metrics?.lowStockAlerts || 0),
      change: 'Needs refill',
      trend: (metrics?.lowStockAlerts || 0) > 0 ? 'down' : 'up',
      icon: AlertTriangle,
      color: (metrics?.lowStockAlerts || 0) > 0 ? 'red' : 'emerald',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
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
              {kpi.value}
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
              <h2 className="text-lg font-semibold">Revenue & Profit Overview</h2>
              <p className="text-sm text-muted-foreground">Last 7 days performance</p>
            </div>
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
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
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
          {categoryData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No sales logged yet to categorize.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto pr-1">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span>{category.name}</span>
                    </div>
                    <span className="font-medium">
                      {category.value}% ({formatCurrency(category.amount)})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          {topProducts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No sales logged yet to determine top sellers.
            </div>
          ) : (
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
                    <p className="text-xs text-muted-foreground">
                      Profit: {product.profit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Alerts */}
        <div className="p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Inventory Alerts</h2>
          {!metrics?.alerts || metrics.alerts.length === 0 ? (
            <div className="p-8 text-center text-success text-sm flex flex-col items-center justify-center h-full">
              <span className="text-2xl mb-1">👍</span>
              <p className="font-semibold">All stock levels healthy!</p>
              <p className="text-xs text-muted-foreground mt-0.5">No low stock items currently.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.type === 'danger'
                      ? 'bg-destructive/5 border-destructive/20'
                      : 'bg-warning/5 border-warning/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{alert.product}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {alert.quantity}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        alert.type === 'danger'
                          ? 'bg-destructive text-white'
                          : 'bg-warning text-white'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ML Dataset Export */}
      <div className="p-6 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">ML Training Dataset</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Download daily sales records with weather, festival, and seasonal context for ML model training.
            </p>
          </div>
          <Button onClick={handleDownloadDataset} disabled={downloadingDataset}>
            <FileDown className="mr-2 h-4 w-4" />
            {downloadingDataset ? "Generating..." : "Download CSV"}
          </Button>
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
