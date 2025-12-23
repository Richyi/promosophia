"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (error) {
      // Error is already handled in the auth provider
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (email: string) => {
    setEmail(email)
    setPassword('demo')
    setIsLoading(true)

    try {
      await login(email, 'demo')
      router.push('/dashboard')
    } catch (error) {
      // Error is already handled in the auth provider
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">PromoSophia</h1>
            <p className="text-slate-400">Trade Promotion Management Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleDemoLogin('s.chen@cpg-corp.com')}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors text-left"
                disabled={isLoading}
              >
                <div className="font-medium">Sarah Chen</div>
                <div className="text-xs text-slate-400">Revenue Manager</div>
              </button>

              <button
                onClick={() => handleDemoLogin('m.johnson@cpg-corp.com')}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors text-left"
                disabled={isLoading}
              >
                <div className="font-medium">Mike Johnson</div>
                <div className="text-xs text-slate-400">Executive</div>
              </button>

              <button
                onClick={() => handleDemoLogin('l.rodriguez@cpg-corp.com')}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors text-left"
                disabled={isLoading}
              >
                <div className="font-medium">Lisa Rodriguez</div>
                <div className="text-xs text-slate-400">Finance</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

