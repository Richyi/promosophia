"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth-provider'
import {
  BarChart3,
  Target,
  ShoppingCart,
  DollarSign,
  FileText,
  Settings,
  Users,
  TrendingUp,
  MessageSquare
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Promotions', href: '/dashboard/promotions', icon: ShoppingCart },
  { name: 'Optimizer', href: '/dashboard/optimizer', icon: Target },
  { name: 'Financials', href: '/dashboard/financials', icon: DollarSign },
  { name: 'Deductions', href: '/dashboard/deductions', icon: FileText },
  { name: 'AI Insights', href: '/dashboard/ai-insights', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    // SuperAdmin and TenantAdmin can see all
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'TENANT_ADMIN') {
      return true
    }

    // Executives and Revenue Managers see most features
    if (user?.role === 'EXECUTIVE' || user?.role === 'REVENUE_MANAGER') {
      return !['Users', 'Settings'].includes(item.name)
    }

    // Account Managers see promotions and analytics
    if (user?.role === 'ACCOUNT_MANAGER') {
      return ['Dashboard', 'Promotions', 'Analytics'].includes(item.name)
    }

    // Finance sees financial features
    if (user?.role === 'FINANCE') {
      return ['Dashboard', 'Financials', 'Deductions', 'Analytics'].includes(item.name)
    }

    // Analysts see analytics and insights
    if (user?.role === 'ANALYST') {
      return ['Dashboard', 'Analytics', 'AI Insights'].includes(item.name)
    }

    // Default to dashboard only
    return item.name === 'Dashboard'
  })

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">PromoSophia</h1>
        <p className="text-sm text-slate-400 mt-1">Trade Promotion Management</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.role?.replace(/([A-Z])/g, ' $1').trim()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
