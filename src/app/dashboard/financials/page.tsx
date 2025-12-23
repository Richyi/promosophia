"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth-provider'
import { DollarSign, TrendingUp, TrendingDown, FileText, PieChart, BarChart3 } from 'lucide-react'

// Mock financial data
const financialMetrics = [
  {
    label: 'Total Trade Spend',
    value: '$2.4M',
    change: '+12.5%',
    changeType: 'positive',
    period: 'FY2025'
  },
  {
    label: 'Accrued Liabilities',
    value: '$456K',
    change: '-8.2%',
    changeType: 'positive',
    period: 'Current'
  },
  {
    label: 'Paid Deductions',
    value: '$234K',
    change: '+5.1%',
    changeType: 'negative',
    period: 'Last 30 days'
  },
  {
    label: 'ROI',
    value: '1.42x',
    change: '+0.23x',
    changeType: 'positive',
    period: 'Average'
  }
]

const pAndLData = [
  { category: 'Trade Spend', amount: 2400000, percentage: 65 },
  { category: 'Incremental Revenue', amount: 3400000, percentage: 92 },
  { category: 'Gross Margin', amount: 680000, percentage: 18 },
  { category: 'Net Profit', amount: 340000, percentage: 9 }
]

export default function FinancialsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Management</h1>
          <p className="text-slate-400 mt-1">P&L analysis, accruals, and financial reporting</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate P&L
          </Button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialMetrics.map((metric, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-5 w-5 text-slate-400" />
                <div className="flex items-center gap-1 text-xs">
                  {metric.changeType === 'positive' ? (
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className={metric.changeType === 'positive' ? 'text-emerald-400' : 'text-red-400'}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-400">{metric.label}</p>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-xs text-slate-500">{metric.period}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* P&L Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">P&L Breakdown</CardTitle>
            <CardDescription>FY2025 trade promotion financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pAndLData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.category}</p>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-bold text-white">
                      ${item.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Monthly Accruals</CardTitle>
            <CardDescription>Trade promotion liabilities by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { month: 'December', amount: 145000, status: 'Accrued' },
                { month: 'January', amount: 98000, status: 'Pending' },
                { month: 'February', amount: 156000, status: 'Projected' }
              ].map((accrual, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{accrual.month} 2025</p>
                    <Badge
                      variant={accrual.status === 'Accrued' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {accrual.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-white">
                    ${accrual.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Financial Transactions</CardTitle>
          <CardDescription>Latest deduction payments and accruals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Retailer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {[
                  { date: '2025-01-15', type: 'Deduction Payment', description: 'Shortage claim settlement', retailer: 'Whole Foods', amount: 2500, status: 'Completed' },
                  { date: '2025-01-12', type: 'Accrual', description: 'Q1 promotion accrual', retailer: 'Kroger', amount: 45000, status: 'Accrued' },
                  { date: '2025-01-08', type: 'Deduction Payment', description: 'Damaged goods claim', retailer: 'Costco', amount: 1200, status: 'Pending' },
                  { date: '2025-01-05', type: 'Accrual Adjustment', description: 'December promotion adjustment', retailer: 'Target', amount: -8500, status: 'Completed' }
                ].map((transaction, i) => (
                  <tr key={i} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4 text-sm text-slate-300">{transaction.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{transaction.type}</td>
                    <td className="px-6 py-4 text-sm text-white">{transaction.description}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{transaction.retailer}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-white">
                      ${transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant={transaction.status === 'Completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

