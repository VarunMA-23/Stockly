import { Brain, TrendingUp, AlertCircle, Sparkles, Target, Calendar } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const forecastData = [
  { date: 'May 13', actual: 4200, forecast: 4100, lower: 3900, upper: 4300 },
  { date: 'May 14', actual: 5100, forecast: 5000, lower: 4700, upper: 5300 },
  { date: 'May 15', actual: 4800, forecast: 4900, lower: 4600, upper: 5200 },
  { date: 'May 16', actual: 6200, forecast: 6100, lower: 5800, upper: 6400 },
  { date: 'May 17', actual: null, forecast: 6800, lower: 6400, upper: 7200 },
  { date: 'May 18', actual: null, forecast: 7200, lower: 6800, upper: 7600 },
  { date: 'May 19', actual: null, forecast: 8100, lower: 7600, upper: 8600 },
];

const productForecasts = [
  {
    product: 'Organic Milk 1L',
    icon: '🥛',
    currentStock: 156,
    forecastedDemand: 342,
    prediction: 'High demand expected',
    confidence: 95,
    action: 'Restock +200 units',
    trend: 'up',
    change: '+18%',
  },
  {
    product: 'Basmati Rice 5kg',
    icon: '🍚',
    currentStock: 234,
    forecastedDemand: 489,
    prediction: 'Stock will run out in 4 days',
    confidence: 92,
    action: 'Urgent restock needed',
    trend: 'up',
    change: '+25%',
  },
  {
    product: 'Fresh Eggs 12pk',
    icon: '🥚',
    currentStock: 89,
    forecastedDemand: 156,
    prediction: 'Normal demand pattern',
    confidence: 88,
    action: 'Restock +100 units',
    trend: 'stable',
    change: '+5%',
  },
  {
    product: 'Potato Chips',
    icon: '🥔',
    currentStock: 445,
    forecastedDemand: 289,
    prediction: 'Peak sales after 6 PM',
    confidence: 91,
    action: 'No action needed',
    trend: 'down',
    change: '-8%',
  },
];

const insights = [
  {
    icon: '📈',
    title: 'Revenue Forecast',
    description: 'Expected to reach $48,500 this week',
    confidence: 94,
    impact: 'high',
  },
  {
    icon: '🌡️',
    title: 'Weather Impact',
    description: 'Hot weather may increase beverage sales by 22%',
    confidence: 87,
    impact: 'medium',
  },
  {
    icon: '📅',
    title: 'Seasonal Trend',
    description: 'Summer produce demand rising steadily',
    confidence: 91,
    impact: 'medium',
  },
  {
    icon: '⚠️',
    title: 'Anomaly Detected',
    description: 'Unusual spike in snack sales detected',
    confidence: 83,
    impact: 'low',
  },
];

export function AIForecasting() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-gradient-from to-emerald-gradient-to flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">AI Forecasting</h1>
          </div>
          <p className="text-muted-foreground">Predictive analytics powered by machine learning</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-emerald-gradient-from to-emerald-gradient-to text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Generate New Forecast
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-muted-foreground">Forecast Accuracy</span>
          </div>
          <p className="text-3xl font-bold">94.8%</p>
          <p className="text-xs text-success mt-1">+2.3% vs last month</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Predicted Growth</span>
          </div>
          <p className="text-3xl font-bold">+18.5%</p>
          <p className="text-xs text-success mt-1">Next 7 days</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">Restock Alerts</span>
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-xs text-warning mt-1">Action required</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-muted-foreground">Model Updated</span>
          </div>
          <p className="text-3xl font-bold">2h ago</p>
          <p className="text-xs text-muted-foreground mt-1">Real-time learning</p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="p-6 bg-gradient-to-br from-card to-card/50 border border-border rounded-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Sales Forecast</h2>
            <p className="text-sm text-muted-foreground">7-day prediction with confidence intervals</p>
          </div>
          <select className="px-3 py-1.5 text-sm bg-background border border-input rounded-lg">
            <option>Next 7 days</option>
            <option>Next 14 days</option>
            <option>Next 30 days</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#confidenceGradient)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#ffffff"
              fillOpacity={0}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm">Forecast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-2 bg-emerald-500/20 rounded"></div>
            <span className="text-sm">Confidence Interval</span>
          </div>
        </div>
      </div>

      {/* Product Forecasts */}
      <div className="p-6 bg-card border border-border rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Product Demand Forecasts</h2>
        <div className="space-y-3">
          {productForecasts.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{item.product}</h3>
                      <p className="text-sm text-muted-foreground">{item.prediction}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        item.trend === 'up'
                          ? 'bg-success/10 text-success'
                          : item.trend === 'down'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-info/10 text-info'
                      }`}
                    >
                      {item.change}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Current Stock</p>
                      <p className="font-semibold">{item.currentStock} units</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Forecasted Demand</p>
                      <p className="font-semibold">{item.forecastedDemand} units</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Confidence</p>
                      <p className="font-semibold text-primary">{item.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Recommended Action</p>
                      <p className="font-semibold">{item.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold">AI-Generated Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="p-4 bg-card rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{insight.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Confidence: <span className="text-primary font-medium">{insight.confidence}%</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        insight.impact === 'high'
                          ? 'bg-destructive/10 text-destructive'
                          : insight.impact === 'medium'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-info/10 text-info'
                      }`}
                    >
                      {insight.impact} impact
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
