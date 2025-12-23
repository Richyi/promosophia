"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/auth-provider'
import {
  MessageSquare,
  Send,
  Bot,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react'

// Mock AI insights and conversations
const mockInsights = [
  {
    id: 'insight-1',
    type: 'prediction',
    title: 'Promotion Lift Prediction',
    content: 'Based on historical data, your upcoming "Coffee Month Special" promotion is predicted to deliver 32% incremental volume lift with a 1.8x ROI. This exceeds your target ROI by 15%.',
    confidence: 0.87,
    timestamp: '2025-01-15 14:30',
    category: 'Performance'
  },
  {
    id: 'insight-2',
    type: 'recommendation',
    title: 'Optimization Opportunity',
    content: 'Consider reducing discount depth on your barista bundle from 33% to 25%. This would improve margin by 8% while maintaining 28% volume lift.',
    confidence: 0.92,
    timestamp: '2025-01-15 11:45',
    category: 'Optimization'
  },
  {
    id: 'insight-3',
    type: 'alert',
    title: 'Seasonal Trend Alert',
    content: 'Holiday promotion performance is trending 12% below forecast. Early indicators suggest supply chain delays may impact Q1 execution.',
    confidence: 0.78,
    timestamp: '2025-01-14 16:20',
    category: 'Risk'
  }
]

const mockConversations = [
  {
    id: 'conv-1',
    user: 'What are my top performing promotions this quarter?',
    ai: 'Based on your Q4 data, your top 3 performing promotions by ROI were:\n\n1. **Holiday Gifting Boost** - 2.1x ROI, $156K incremental revenue\n2. **Coffee Month Special** - 1.83x ROI, $89K incremental revenue\n3. **Q4 Barista Bundle** - 1.15x ROI, $45K incremental revenue\n\nThe Holiday promotion significantly outperformed due to strong seasonal demand and effective retail execution.',
    timestamp: '2025-01-15 10:15'
  },
  {
    id: 'conv-2',
    user: 'How can I improve promotion effectiveness with Kroger?',
    ai: 'For Kroger promotions, I recommend:\n\n1. **Timing**: Schedule promotions during their bi-weekly circular cycles\n2. **Depth**: Keep discount depth under 20% for better margins\n3. **Display**: Prioritize end-cap placements over mid-aisle\n4. **Frequency**: Limit to 2-3 promotions per quarter to avoid retailer fatigue\n\nHistorical data shows 25% higher lift when aligned with their promotional calendar.',
    timestamp: '2025-01-14 09:30'
  }
]

export default function AIInsightsPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState(mockConversations)

  const handleAskAI = async () => {
    if (!query.trim()) return

    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const newConversation = {
        id: `conv-${Date.now()}`,
        user: query,
        ai: `Thank you for your question: "${query}". Based on your TPM data, I can provide insights about promotion performance, optimization opportunities, and strategic recommendations. Would you like me to analyze specific promotions, retailers, or time periods?`,
        timestamp: new Date().toLocaleString()
      }

      setConversations(prev => [newConversation, ...prev])
      setQuery('')
      setIsLoading(false)
    }, 2000)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return <TrendingUp className="h-5 w-5 text-blue-400" />
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-yellow-400" />
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-400" />
      default:
        return <Bot className="h-5 w-5 text-slate-400" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'prediction':
        return 'border-blue-500/20 bg-blue-500/5'
      case 'recommendation':
        return 'border-yellow-500/20 bg-yellow-500/5'
      case 'alert':
        return 'border-red-500/20 bg-red-500/5'
      default:
        return 'border-slate-500/20 bg-slate-500/5'
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Insights</h1>
          <p className="text-slate-400 mt-1">Intelligent analysis and natural language queries</p>
        </div>
        <Button variant="outline" className="border-slate-600 text-slate-300">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Insights
        </Button>
      </div>

      {/* AI Query Interface */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Ask RT-Smarts AI
          </CardTitle>
          <CardDescription>
            Get intelligent insights about your trade promotion performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Ask about promotion performance, optimization opportunities, or strategic insights..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <Button
              onClick={handleAskAI}
              disabled={isLoading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-500"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Example Queries */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "What are my top performing promotions?",
              "How can I optimize ROI for Kroger?",
              "Show me seasonal trends",
              "Predict lift for new promotion"
            ].map((example, i) => (
              <button
                key={i}
                onClick={() => setQuery(example)}
                className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Intelligent Insights</CardTitle>
              <CardDescription>AI-powered analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">
                              {Math.round(insight.confidence * 100)}% confidence
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              insight.category === 'Performance' ? 'bg-blue-500/20 text-blue-400' :
                              insight.category === 'Optimization' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {insight.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">{insight.content}</p>
                        <p className="text-xs text-slate-500">{insight.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation History */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Conversations</CardTitle>
            <CardDescription>Your AI query history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversations.map((conv) => (
                <div key={conv.id} className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{conv.user}</p>
                      <p className="text-xs text-slate-500">{conv.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-300 whitespace-pre-line">{conv.ai}</div>
                    </div>
                  </div>
                  <div className="border-t border-slate-700"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI Performance Analytics
          </CardTitle>
          <CardDescription>Track AI prediction accuracy and insights impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">87%</div>
              <p className="text-sm text-slate-400">Prediction Accuracy</p>
              <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">1.45x</div>
              <p className="text-sm text-slate-400">Avg ROI Improvement</p>
              <p className="text-xs text-slate-500 mt-1">From AI recommendations</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">23</div>
              <p className="text-sm text-slate-400">Insights Generated</p>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

