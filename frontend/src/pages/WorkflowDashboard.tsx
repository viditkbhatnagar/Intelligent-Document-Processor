import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Transaction {
  _id: string
  transactionId: string
  status: string
  currentStep: {
    stepName: string
    description: string
  }
  entities: {
    supplier?: { name: string }
    tradingCompany?: { name: string }
    customer?: { name: string }
  }
  documents: Array<{
    documentType: string
    status: string
    role: string
  }>
  totalAmount?: number
  currency?: string
  nextSuggestedActions: Array<{
    action: string
    description: string
    priority: 'high' | 'medium' | 'low'
    confidence: number
  }>
  updatedDate: string
}

interface DashboardData {
  summary: {
    totalTransactions: number
    completedTransactions: number
    activeTransactions: number
    statusBreakdown: { [key: string]: number }
  }
  highPriorityActions: Array<{
    action: string
    description: string
    priority: string
    confidence: number
  }>
  recentTransactions: Transaction[]
}

const WorkflowDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
    fetchTransactions()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/workflow/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const result = await response.json()
      setDashboardData(result.dashboard)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Error fetching dashboard:', err)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/workflow/transactions')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const result = await response.json()
      setTransactions(result.transactions)
    } catch (err) {
      setError('Failed to load transactions')
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'quotation_received': 'bg-blue-100 text-blue-800',
      'po_issued': 'bg-purple-100 text-purple-800',
      'proforma_received': 'bg-yellow-100 text-yellow-800',
      'payment_made': 'bg-orange-100 text-orange-800',
      'order_ready': 'bg-indigo-100 text-indigo-800',
      'invoice_received': 'bg-pink-100 text-pink-800',
      'completed': 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'high': 'bg-red-100 text-red-800 border-red-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="border-red-200">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Trading Workflow Dashboard</h1>
        <Button onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      {dashboardData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.summary.totalTransactions}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{dashboardData.summary.activeTransactions}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dashboardData.summary.completedTransactions}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.summary.totalTransactions > 0 
                    ? Math.round((dashboardData.summary.completedTransactions / dashboardData.summary.totalTransactions) * 100)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* High Priority Actions */}
          {dashboardData.highPriorityActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>High Priority Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.highPriorityActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <div className="font-medium text-red-900">{action.action.replace(/_/g, ' ').toUpperCase()}</div>
                        <div className="text-sm text-red-700">{action.description}</div>
                      </div>
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.confidence > 0.8 ? 'High Confidence' : 'Medium Confidence'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found. Upload some documents to get started.
              </div>
            ) : (
              transactions.slice(0, 10).map((transaction) => (
                <div key={transaction._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-lg">{transaction.transactionId}</div>
                      <div className="text-sm text-gray-600">{transaction.currentStep.stepName}</div>
                    </div>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    {transaction.entities.supplier && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">Supplier</div>
                        <div className="text-sm">{transaction.entities.supplier.name}</div>
                      </div>
                    )}
                    {transaction.entities.tradingCompany && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">Trading Company</div>
                        <div className="text-sm">{transaction.entities.tradingCompany.name}</div>
                      </div>
                    )}
                    {transaction.entities.customer && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">Customer</div>
                        <div className="text-sm">{transaction.entities.customer.name}</div>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">Documents</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {transaction.documents.length} uploaded
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {transaction.documents.map((doc, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {doc.documentType.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {transaction.nextSuggestedActions.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-2">Next Actions</div>
                      <div className="space-y-1">
                        {transaction.nextSuggestedActions.slice(0, 2).map((action, index) => (
                          <div key={index} className="text-sm text-blue-600 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            {action.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-2">
                    Last updated: {new Date(transaction.updatedDate).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WorkflowDashboard
