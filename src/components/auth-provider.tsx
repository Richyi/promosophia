"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthContext, AuthUser, getCurrentUser, setCurrentUser, mockUsers } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

const AuthContextProvider = createContext<AuthContext | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check for existing session on mount
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock authentication - find user by email
      const foundUser = mockUsers.find(u => u.email === email)

      if (!foundUser) {
        throw new Error('Invalid credentials')
      }

      // In real implementation, validate password against StackAuth
      setUser(foundUser)
      setCurrentUser(foundUser)

      toast({
        title: "Welcome back!",
        description: `Logged in as ${foundUser.name}`,
      })
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setUser(null)
    setCurrentUser(null)

    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  const switchTenant = async (tenantId: string) => {
    if (!user) return

    // In real implementation, this would call StackAuth to switch teams
    const updatedUser = { ...user, tenantId }
    setUser(updatedUser)
    setCurrentUser(updatedUser)

    toast({
      title: "Tenant switched",
      description: "Successfully switched to new tenant",
    })
  }

  const value: AuthContext = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchTenant,
  }

  return (
    <AuthContextProvider.Provider value={value}>
      {children}
    </AuthContextProvider.Provider>
  )
}

export function useAuth(): AuthContext {
  const context = useContext(AuthContextProvider)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

