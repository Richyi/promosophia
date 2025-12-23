"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/auth-provider'
import { PromotionStatus } from '@/types'
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle
} from 'lucide-react'

// Mock data - in real app this would come from API
const mockPromotions = [
  {
    id: 'tp-1',
    name: 'Coffee Month Special',
    retailer: 'Whole Foods Market',
    product: 'Premium Espresso 250g',
    status: PromotionStatus.ACTIVE,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    mechanic: '15% Off TPR',
    plannedSpend: 25000,
    actualSpend: 24200,
    roi: 1.83,
    liftPercent: 24,
  },
  {
    id: 'tp-2',
    name: 'Q4 Barista Bundle',
    retailer: 'Kroger',
    product: 'Oat Milk Barista 1L',
    status: PromotionStatus.PLANNED,
    startDate: '2025-01-15',
    endDate: '2025-02-15',
    mechanic: 'Buy 2 Get 1',
    plannedSpend: 45000,
    roi: 1.15,
    liftPercent: 45,
  },
  {
    id: 'tp-3',
    name: 'Holiday Gifting Boost',
    retailer: 'Costco',
    product: 'Caramel Syrup 500ml',
    status: PromotionStatus.COMPLETED,
    startDate: '2024-11-20',
    endDate: '2024-12-25',
    mechanic: 'Display + $1 Off',
    plannedSpend: 15000,
    actualSpend: 15200,
    roi: 1.03,
    liftPercent: 12,
  }
]

const mockRetailers = ['All', 'Whole Foods Market', 'Kroger', 'Costco', 'Target']
const mockCategories = ['All', 'Coffee', 'Dairy Alternatives', 'Add-ons']

export default function PromotionsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [retailerFilter, setRetailerFilter] = useState<string>('All')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')

  const getStatusColor = (status: PromotionStatus) => {
    switch (status) {
      case PromotionStatus.ACTIVE:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case PromotionStatus.PLANNED:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case PromotionStatus.DRAFT:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case PromotionStatus.COMPLETED:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case PromotionStatus.CANCELLED:
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const filteredPromotions = useMemo(() => {
    return mockPromotions.filter(promo => {
      const matchesSearch = promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          promo.retailer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          promo.product.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'All' || promo.status === statusFilter
      const matchesRetailer = retailerFilter === 'All' || promo.retailer === retailerFilter

      return matchesSearch && matchesStatus && matchesRetailer
    })
  }, [searchTerm, statusFilter, retailerFilter])

  const handleAction = (action: string, promoId: string) => {
    console.log(`Action: ${action} for promotion: ${promoId}`)
    // In real app, this would call API
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trade Promotions</h1>
          <p className="text-slate-400 mt-1">Manage and track all trade promotion activities</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          New Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-sm text-slate-400">Active Promotions</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">$142k</div>
            <p className="text-sm text-slate-400">Total Spend</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">1.45x</div>
            <p className="text-sm text-slate-400">Avg ROI</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">23%</div>
            <p className="text-sm text-slate-400">Avg Lift</p>
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
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              >
                <option value="All">All Status</option>
                <option value={PromotionStatus.DRAFT}>Draft</option>
                <option value={PromotionStatus.PLANNED}>Planned</option>
                <option value={PromotionStatus.ACTIVE}>Active</option>
                <option value={PromotionStatus.COMPLETED}>Completed</option>
              </select>

              <select
                value={retailerFilter}
                onChange={(e) => setRetailerFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              >
                {mockRetailers.map(retailer => (
                  <option key={retailer} value={retailer}>{retailer}</option>
                ))}
              </select>

              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Promotion Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Retailer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredPromotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-white hover:text-blue-400 cursor-pointer">
                          {promo.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {promo.product} • {promo.mechanic}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">{promo.retailer}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-400 font-mono">
                        {promo.startDate}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {promo.endDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {promo.roi && (
                        <span className={`text-sm font-bold ${
                          promo.roi >= 1.5 ? 'text-emerald-400' :
                          promo.roi >= 1.2 ? 'text-blue-400' : 'text-slate-300'
                        }`}>
                          {promo.roi}x
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={getStatusColor(promo.status)}>
                        {promo.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-bold text-white">
                        ${promo.plannedSpend?.toLocaleString()}
                      </div>
                      {promo.actualSpend && (
                        <div className="text-[10px] text-slate-500">
                          Actual: ${promo.actualSpend.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction('view', promo.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction('edit', promo.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction('more', promo.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPromotions.length === 0 && (
            <div className="p-20 text-center">
              <div className="text-slate-600 mb-2">No promotions found matching your criteria.</div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('All')
                  setRetailerFilter('All')
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

