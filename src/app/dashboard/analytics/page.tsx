"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth-provider'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Download,
  Filter,
  Target,
  DollarSign,
  ShoppingCart
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

// Mock analytics data
const performanceData = [
  { month: 'Aug', roi: 1.2, volume: 85000, spend: 42000 },
  { month: 'Sep', roi: 1.8, volume: 92000, spend: 38000 },
  { month: 'Oct', roi: 1.5, volume: 88000, spend: 45000 },
  { month: 'Nov', roi: 2.1, volume: 95000, spend: 41000 },
  { month: 'Dec', roi: 1.9, volume: 102000, spend: 48000 },
  { month: 'Jan', roi: 1.7, volume: 89000, spend: 43000 }
]

const retailerPerformance = [
  { name: 'Whole Foods', roi: 2.2, volume: 45000, color: '#3b82f6' },
  { name: 'Kroger', roi: 1.8, volume: 38000, color: '#10b981' },
  { name: 'Costco', roi: 1.6, volume: 42000, color: '#f59e0b' },
  { name: 'Target', roi: 1.4, volume: 35000, color: '#ef4444' }
]

const categoryPerformance = [
  { name: 'Coffee', value: 45, color: '#3b82f6' },
  { name: 'Dairy Alt', value: 30, color: '#10b981' },
  { name: 'Add-ons', value: 25, color: '#f59e0b' }
]

const kpiTrends = [
  { metric: 'Overall ROI', current: 1.85, previous: 1.62, change: '+14.3%', trend: 'up' },
  { metric: 'Volume Lift', current: 28.5, previous: 24.1, change: '+18.3%', trend: 'up' },
  { metric: 'Margin Impact', current: 3.2, previous: 2.8, change: '+14.3%', trend: 'up' },
  { metric: 'Spend Efficiency', current: 92.1, previous: 88.5, change: '+4.1%', trend: 'up' }
]

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('6months')

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trade Analytics</h1>
          <p className="text-slate-400 mt-1">Deep insights into promotion performance and trends</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiTrends.map((kpi, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400">{kpi.metric}</h3>
                <div className="flex items-center gap-1">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-xs font-bold ${
                    kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {kpi.change}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-white">
                  {kpi.metric.includes('ROI') ? `${kpi.current}x` :
                   kpi.metric.includes('Lift') || kpi.metric.includes('Impact') ? `${kpi.current}%` :
                   kpi.metric.includes('Efficiency') ? `${kpi.current}%` : kpi.current}
                </p>
                <p className="text-xs text-slate-500">
                  Previous: {kpi.metric.includes('ROI') ? `${kpi.previous}x` :
                            kpi.metric.includes('Lift') || kpi.metric.includes('Impact') ? `${kpi.previous}%` :
                            kpi.metric.includes('Efficiency') ? `${kpi.previous}%` : kpi.previous}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Trends */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Performance Trends</CardTitle>
            <CardDescription>ROI and volume performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="roi" orientation="left" stroke="#3b82f6" fontSize={12} />
                  <YAxis yAxisId="volume" orientation="right" stroke="#10b981" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#f9fafb' }}
                  />
                  <Line
                    yAxisId="roi"
                    type="monotone"
                    dataKey="roi"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="ROI (x)"
                  />
                  <Line
                    yAxisId="volume"
                    type="monotone"
                    dataKey="volume"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Volume"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Retailer Performance */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Retailer Performance</CardTitle>
            <CardDescription>ROI comparison across retailers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {retailerPerformance.map((retailer, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: retailer.color }}
                    />
                    <span className="text-sm font-medium text-white">{retailer.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">
                      ${retailer.volume.toLocaleString()}
                    </span>
                    <Badge variant="outline" className="border-slate-600">
                      {retailer.roi}x ROI
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Category Performance</CardTitle>
            <CardDescription>Revenue contribution by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {categoryPerformance.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-slate-400">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Top Performing Promotions</CardTitle>
            <CardDescription>Highest ROI promotions this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Holiday Gifting Boost', roi: 2.1, retailer: 'Costco' },
                { name: 'Coffee Month Special', roi: 1.83, retailer: 'Whole Foods' },
                { name: 'Q4 Barista Bundle', roi: 1.15, retailer: 'Kroger' }
              ].map((promo, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{promo.name}</p>
                    <p className="text-xs text-slate-400">{promo.retailer}</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {promo.roi}x ROI
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seasonal Insights */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Seasonal Insights</CardTitle>
            <CardDescription>Performance patterns and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Peak Season</span>
                </div>
                <p className="text-xs text-slate-300">
                  Q4 promotions show 35% higher lift during holiday periods
                </p>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Growth Trend</span>
                </div>
                <p className="text-xs text-slate-300">
                  Coffee category showing 22% YoY volume growth
                </p>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Efficiency</span>
                </div>
                <p className="text-xs text-slate-300">
                  Cost per incremental unit down 12% this quarter
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Export Analytics</CardTitle>
          <CardDescription>Download detailed reports and data exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-700 hover:bg-slate-600">
              <BarChart3 className="h-6 w-6" />
              <span>Performance Report</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-700 hover:bg-slate-600">
              <PieChart className="h-6 w-6" />
              <span>Retailer Analysis</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-700 hover:bg-slate-600">
              <TrendingUp className="h-6 w-6" />
              <span>Trend Analysis</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
