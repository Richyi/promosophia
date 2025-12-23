"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/auth-provider'
import { OptimizationGoal } from '@/types'
import {
  Target,
  TrendingUp,
  DollarSign,
  Play,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Zap
} from 'lucide-react'

// Mock optimization results
const mockScenarios = [
  {
    id: 'scenario-1',
    name: 'Aggressive Volume Growth',
    goal: OptimizationGoal.VOLUME,
    predictedLift: 48,
    totalRevenue: 185000,
    totalVolume: 25000,
    totalMargin: 0.38,
    roi: 1.2,
    spend: 85000,
    confidence: 0.85,
    description: 'Maximize unit sales with deep discounts and high frequency'
  },
  {
    id: 'scenario-2',
    name: 'Balanced Revenue Optimization',
    goal: OptimizationGoal.REVENUE,
    predictedLift: 32,
    totalRevenue: 142500,
    totalVolume: 18500,
    totalMargin: 0.42,
    roi: 1.8,
    spend: 45000,
    confidence: 0.92,
    description: 'Optimal balance between volume and margin'
  },
  {
    id: 'scenario-3',
    name: 'Maximum Margin Efficiency',
    goal: OptimizationGoal.MARGIN,
    predictedLift: 18,
    totalRevenue: 98500,
    totalVolume: 12500,
    totalMargin: 0.48,
    roi: 2.4,
    spend: 32000,
    confidence: 0.88,
    description: 'Focus on high-margin products with targeted promotions'
  }
]

export default function OptimizerPage() {
  const { user } = useAuth()
  const [selectedGoal, setSelectedGoal] = useState<OptimizationGoal>(OptimizationGoal.REVENUE)
  const [budget, setBudget] = useState(100000)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleOptimize = async () => {
    setIsOptimizing(true)

    // Simulate optimization process
    setTimeout(() => {
      setResults({
        scenarios: mockScenarios,
        bestScenario: mockScenarios[1], // Balanced scenario
        processingTime: 2.3,
        totalPromotions: 12,
        totalProducts: 8,
        totalRetailers: 5
      })
      setIsOptimizing(false)
    }, 2300)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Trade Promotion Optimizer</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Leverage AI-powered predictive modeling and mathematical optimization to maximize your trade promotion ROI
        </p>
      </div>

      {/* Optimization Engine */}
      <Card className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Zap className="h-6 w-6 text-indigo-400" />
            TPO Simulation Engine
          </CardTitle>
          <CardDescription className="text-slate-300">
            Configure your optimization parameters and let AI find the optimal promotion strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Goal */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Primary Goal
              </label>
              <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700">
                {([
                  { key: OptimizationGoal.REVENUE, label: 'Revenue' },
                  { key: OptimizationGoal.VOLUME, label: 'Volume' },
                  { key: OptimizationGoal.MARGIN, label: 'Margin' },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedGoal(key)}
                    className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                      selectedGoal === key
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Budget */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Available Budget
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                  $
                </span>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="pl-8 bg-slate-900/50 border-slate-600 text-white"
                  placeholder="100000"
                />
              </div>
            </div>

            {/* Optimize Button */}
            <div className="flex items-end">
              <Button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="animate-spin h-5 w-5" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Solve Allocation
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-indigo-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-indigo-300 mb-1">AI Recommendation</p>
                <p className="text-sm text-slate-300">
                  Based on historical data, targeting revenue optimization with a ${formatCurrency(budget)} budget
                  should yield 32% incremental lift with 1.8x ROI. Consider seasonal patterns for Q1 promotions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-slate-400 uppercase">Predicted Lift</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatPercentage(results.bestScenario.predictedLift)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-slate-400 uppercase">Total Revenue</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(results.bestScenario.totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-slate-400 uppercase">ROI</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {results.bestScenario.roi}x
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-slate-400 uppercase">Confidence</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatPercentage(results.bestScenario.confidence * 100)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scenario Comparison */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Compare Scenarios
              </CardTitle>
              <CardDescription>
                Review different optimization approaches and select the best strategy for your goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.scenarios.map((scenario: any, index: number) => (
                  <div
                    key={scenario.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      scenario.id === results.bestScenario.id
                        ? 'bg-indigo-500/10 border-indigo-500/30'
                        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        scenario.id === results.bestScenario.id
                          ? 'bg-indigo-600'
                          : 'bg-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">{scenario.name}</p>
                        <p className="text-xs text-slate-400 mb-2">{scenario.description}</p>
                        <div className="flex gap-4 text-xs">
                          <span className="text-slate-500">
                            Lift: <span className="text-indigo-400 font-mono">{formatPercentage(scenario.predictedLift)}</span>
                          </span>
                          <span className="text-slate-500">
                            Confidence: <span className="text-green-400 font-mono">{formatPercentage(scenario.confidence * 100)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-8 text-right">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">
                          Planned Spend
                        </p>
                        <p className="text-sm font-mono text-white">{formatCurrency(scenario.spend)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">
                          Est. Revenue
                        </p>
                        <p className="text-sm font-mono text-white">{formatCurrency(scenario.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">
                          ROI
                        </p>
                        <p className={`text-sm font-mono font-bold ${
                          scenario.roi >= 2.0 ? 'text-emerald-400' :
                          scenario.roi >= 1.5 ? 'text-blue-400' : 'text-slate-300'
                        }`}>
                          {scenario.roi}x
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className={`${
                          scenario.id === results.bestScenario.id
                            ? 'bg-indigo-600 hover:bg-indigo-500'
                            : 'bg-slate-600 hover:bg-slate-500'
                        }`}
                      >
                        {scenario.id === results.bestScenario.id ? 'Apply Plan' : 'Compare'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Processing Details */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Optimization Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Processing Time</p>
                  <p className="text-white font-mono">{results.processingTime}s</p>
                </div>
                <div>
                  <p className="text-slate-400">Total Promotions</p>
                  <p className="text-white font-mono">{results.totalPromotions}</p>
                </div>
                <div>
                  <p className="text-slate-400">Products Analyzed</p>
                  <p className="text-white font-mono">{results.totalProducts}</p>
                </div>
                <div>
                  <p className="text-slate-400">Retailers Included</p>
                  <p className="text-white font-mono">{results.totalRetailers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

