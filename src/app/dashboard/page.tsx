"use client"

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { TrendingUp, TrendingDown, Target, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react'

// Mock data - in real app this would come from API
const kpis = [
  {
    label: 'Total ROI',
    value: '1.42x',
    trend: '+12%',
    trendUp: true,
    color: 'text-emerald-400',
    icon: TrendingUp
  },
  {
    label: 'Trade Spend',
    value: '$84.2k',
    trend: '-2.4%',
    trendUp: false,
    color: 'text-blue-400',
    icon: DollarSign
  },
  {
    label: 'Incremental Volume',
    value: '18.5k',
    trend: '+8.1%',
    trendUp: true,
    color: 'text-amber-400',
    icon: ShoppingCart
  },
  {
    label: 'Deduction Exposure',
    value: '$12.4k',
    trend: '-15%',
    trendUp: true,
    color: 'text-rose-400',
    icon: AlertTriangle
  }
]

const chartData = [
  { month: 'Jul', baseline: 4000, promoted: 4800 },
  { month: 'Aug', baseline: 3800, promoted: 5200 },
  { month: 'Sep', baseline: 4200, promoted: 6100 },
  { month: 'Oct', baseline: 4500, promoted: 5800 },
  { month: 'Nov', baseline: 4800, promoted: 7500 },
  { month: 'Dec', baseline: 5200, promoted: 8400 }
]

const companyGoals = [
  { type: 'Revenue', target: 5000000, current: 3250000 },
  { type: 'Volume', target: 1000000, current: 650000 },
  { type: 'Margin', target: 0.42, current: 0.39 }
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Overview</h1>
          <p className="text-slate-400 mt-1">Real-time promotion effectiveness for FY2025</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            Export Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500">
            Run Optimization
          </Button>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-slate-300">
          Your trade promotion performance is looking strong. Here are the key metrics for your portfolio.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <Card key={i} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="h-5 w-5 text-slate-400" />
                  <div className="flex items-center gap-1 text-xs font-bold">
                    {kpi.trendUp ? (
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                    <span className={kpi.color}>{kpi.trend}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-400 mb-2">{kpi.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{kpi.value}</h3>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Baseline vs. Promoted Sales Volume</CardTitle>
            <CardDescription>Monthly performance comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPromoted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '8px'
                    }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="promoted"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorPromoted)"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    stroke="#475569"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Company Goals */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Strategic Goals Progress</CardTitle>
            <CardDescription>FY2025 targets and current performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {companyGoals.map((goal, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">{goal.type}</span>
                    <span className="text-white font-bold">
                      {Math.round((goal.current / goal.target) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        goal.type === 'Margin' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(goal.current / goal.target) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>
                      Current: {goal.type === 'Margin'
                        ? `${(goal.current * 100).toFixed(1)}%`
                        : `$${(goal.current / 1000000).toFixed(1)}M`
                      }
                    </span>
                    <span>
                      Target: {goal.type === 'Margin'
                        ? `${(goal.target * 100).toFixed(1)}%`
                        : `$${(goal.target / 1000000).toFixed(1)}M`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300 italic">
                "AI Predictor: You are trending to exceed Volume targets by 4% if the Q1 Coffee bundle is approved."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription>Common tasks and workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-700 hover:bg-slate-600">
              <Target className="h-6 w-6" />
              <span>New Promotion</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-700 hover:bg-slate-600">
              <TrendingUp className="h-6 w-6" />
              <span>Run Optimizer</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-700 hover:bg-slate-600">
              <DollarSign className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

