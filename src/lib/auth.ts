// Placeholder authentication utilities
// These will be replaced with actual StackAuth integration

import { User, UserRole } from '@/types'

export interface AuthUser extends User {
  // Additional auth-specific fields can be added here
}

export interface AuthContext {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  switchTenant: (tenantId: string) => Promise<void>
}

// Mock users for development
export const mockUsers: AuthUser[] = [
  {
    id: 'u-1',
    name: 'Sarah Chen',
    email: 's.chen@cpg-corp.com',
    role: UserRole.TENANT_ADMIN,
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'u-2',
    name: 'Mike Johnson',
    email: 'm.johnson@cpg-corp.com',
    role: UserRole.EXECUTIVE,
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'u-3',
    name: 'Lisa Rodriguez',
    email: 'l.rodriguez@cpg-corp.com',
    role: UserRole.FINANCE,
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'u-4',
    name: 'David Kim',
    email: 'd.kim@cpg-corp.com',
    role: UserRole.ACCOUNT_MANAGER,
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Mock tenants
export const mockTenants = [
  {
    id: 'tenant-1',
    name: 'CPG Corporation',
    industry: 'Consumer Packaged Goods',
    size: 'Enterprise',
    domain: 'cpg-corp.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Utility functions
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem('rt-smarts-user')
  if (!stored) return null

  try {
    const userData = JSON.parse(stored)
    return {
      ...userData,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
    }
  } catch {
    return null
  }
}

export function setCurrentUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') return

  if (user) {
    localStorage.setItem('rt-smarts-user', JSON.stringify(user))
  } else {
    localStorage.removeItem('rt-smarts-user')
  }
}

export function hasPermission(user: AuthUser | null, requiredRole: UserRole): boolean {
  if (!user) return false

  const roleHierarchy = {
    [UserRole.SUPER_ADMIN]: 7,
    [UserRole.TENANT_ADMIN]: 6,
    [UserRole.EXECUTIVE]: 5,
    [UserRole.REVENUE_MANAGER]: 4,
    [UserRole.ACCOUNT_MANAGER]: 3,
    [UserRole.FINANCE]: 2,
    [UserRole.ANALYST]: 1,
  }

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

export function canAccessTenant(user: AuthUser | null, tenantId: string): boolean {
  return user?.tenantId === tenantId
}

