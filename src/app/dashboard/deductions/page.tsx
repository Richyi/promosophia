"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/auth-provider'
import { DeductionStatus } from '@/types'
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  FileText
} from 'lucide-react'

// Mock deductions data
const mockDeductions = [
  {
    id: 'd-1',
    retailer: 'Whole Foods Market',
    promotion: 'Coffee Month Special',
    type: 'Shortage',
    reason: 'Inventory shortage at store #1234',
    amount: 2500.00,
    status: DeductionStatus.OPEN,
    date: '2025-01-10',
    dueDate: '2025-02-10',
    invoice: 'INV-2025-001'
  },
  {
    id: 'd-2',
    retailer: 'Kroger',
    promotion: 'Q4 Barista Bundle',
    type: 'Trade Discount',
    reason: 'Additional trade discount applied',
    amount: 12500.00,
    status: DeductionStatus.PENDING,
    date: '2025-01-08',
    dueDate: '2025-02-08',
    invoice: 'INV-2025-002'
  },
  {
    id: 'd-3',
    retailer: 'Costco',
    promotion: 'Holiday Gifting Boost',
    type: 'Damaged Goods',
    reason: 'Product damaged in transit',
    amount: 1200.50,
    status: DeductionStatus.CLEARED,
    date: '2024-12-20',
    dueDate: '2025-01-20',
    invoice: 'INV-2024-156'
  },
  {
    id: 'd-4',
    retailer: 'Target',
    promotion: null,
    type: 'Administrative Fee',
    reason: 'Late payment processing fee',
    amount: 150.00,
    status: DeductionStatus.CONTESTED,
    date: '2025-01-05',
    dueDate: '2025-02-05',
    invoice: 'INV-2025-003'
  }
]

export default function DeductionsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  const getStatusColor = (status: DeductionStatus) => {
    switch (status) {
      case DeductionStatus.OPEN:
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case DeductionStatus.PENDING:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case DeductionStatus.CLEARED:
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case DeductionStatus.CONTESTED:
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getStatusIcon = (status: DeductionStatus) => {
    switch (status) {
      case DeductionStatus.OPEN:
        return <AlertTriangle className="h-4 w-4" />
      case DeductionStatus.PENDING:
        return <Clock className="h-4 w-4" />
      case DeductionStatus.CLEARED:
        return <CheckCircle className="h-4 w-4" />
      case DeductionStatus.CONTESTED:
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const filteredDeductions = mockDeductions.filter(deduction => {
    const matchesSearch = deduction.retailer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deduction.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (deduction.promotion && deduction.promotion.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'All' || deduction.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalOpen = mockDeductions.filter(d => d.status === DeductionStatus.OPEN).reduce((sum, d) => sum + d.amount, 0)
  const totalPending = mockDeductions.filter(d => d.status === DeductionStatus.PENDING).reduce((sum, d) => sum + d.amount, 0)
  const totalCleared = mockDeductions.filter(d => d.status === DeductionStatus.CLEARED).reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Deductions Management</h1>
          <p className="text-slate-400 mt-1">Track and resolve retailer deductions and claims</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500">
            <FileText className="h-4 w-4 mr-2" />
            New Claim
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-slate-400">Open Deductions</span>
            </div>
            <p className="text-2xl font-bold text-white">${totalOpen.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">
              {mockDeductions.filter(d => d.status === DeductionStatus.OPEN).length} items
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-slate-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">${totalPending.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">
              {mockDeductions.filter(d => d.status === DeductionStatus.PENDING).length} items
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm text-slate-400">Cleared</span>
            </div>
            <p className="text-2xl font-bold text-white">${totalCleared.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">
              {mockDeductions.filter(d => d.status === DeductionStatus.CLEARED).length} items
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-slate-400">Total Exposure</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${(totalOpen + totalPending).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">Outstanding</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search deductions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              >
                <option value="All">All Status</option>
                <option value={DeductionStatus.OPEN}>Open</option>
                <option value={DeductionStatus.PENDING}>Pending</option>
                <option value={DeductionStatus.CLEARED}>Cleared</option>
                <option value={DeductionStatus.CONTESTED}>Contested</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deductions Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Deduction Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Retailer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredDeductions.map((deduction) => (
                  <tr key={deduction.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-white">{deduction.reason}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {deduction.promotion ? `Promotion: ${deduction.promotion}` : 'No associated promotion'}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 font-mono">
                          {deduction.invoice}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">{deduction.retailer}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">{deduction.type}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-bold text-white">
                        ${deduction.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(deduction.status)}
                        <Badge className={getStatusColor(deduction.status)}>
                          {deduction.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">{deduction.dueDate}</div>
                      <div className="text-xs text-slate-500">Due: {deduction.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          View
                        </Button>
                        {deduction.status === DeductionStatus.OPEN && (
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                            Contest
                          </Button>
                        )}
                        {deduction.status === DeductionStatus.PENDING && (
                          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                            Approve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDeductions.length === 0 && (
            <div className="p-20 text-center">
              <div className="text-slate-600 mb-2">No deductions found matching your criteria.</div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('All')
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

