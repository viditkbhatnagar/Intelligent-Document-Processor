import React, { useEffect, useState } from 'react';
import ActionableWorkflow from '../components/ActionableWorkflow';

interface Transaction {
  _id: string;
  transactionId: string;
  status: string;
  entities: any;
  documents: any[];
  totalAmount?: string;
  currency?: string;
  createdDate: string;
  nextSuggestedActions: any[];
}

const ActionableWorkflowDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    successRate: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/workflow/dashboard');
      const data = await response.json();
      
      if (data.dashboard) {
        setTransactions(data.dashboard.recentTransactions || []);
        const summary = data.dashboard.summary || {};
        setStats({
          total: summary.totalTransactions || 0,
          active: summary.activeTransactions || 0,
          completed: summary.completedTransactions || 0,
          successRate: summary.totalTransactions > 0 ? Math.round((summary.completedTransactions / summary.totalTransactions) * 100) : 0
        });
      }
    } catch (error) {
      console.error('Error fetching workflow dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'quotation_received': 'bg-blue-100 text-blue-800',
      'po_issued': 'bg-purple-100 text-purple-800',
      'proforma_received': 'bg-yellow-100 text-yellow-800',
      'invoice_received': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'templates_generated': 'bg-indigo-100 text-indigo-800',
      'submitted_to_bank': 'bg-teal-100 text-teal-800',
      'payment_received': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getActionableTransactions = () => {
    return transactions.filter(t => 
      ['completed', 'templates_generated', 'submitted_to_bank', 'payment_received', 'invoice_received'].includes(t.status) ||
      (t.nextSuggestedActions && t.nextSuggestedActions.length > 0)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🚀 Actionable Trading Workflow</h1>
            <p className="text-lg text-gray-600 mt-2">Generate templates, manage transactions, and complete your trading workflow</p>
          </div>
          <button 
            onClick={() => {
              fetchDashboardData();
              setSelectedTransaction(null);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Refresh
          </button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-blue-100">Total Transactions</p>
              </div>
              <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats.active}</p>
                <p className="text-yellow-100">In Progress</p>
              </div>
              <svg className="w-8 h-8 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats.completed}</p>
                <p className="text-green-100">Completed</p>
              </div>
              <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{getActionableTransactions().length}</p>
                <p className="text-purple-100">Ready for Action</p>
              </div>
              <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Priority Actions Alert */}
        {getActionableTransactions().length > 0 && !selectedTransaction && (
          <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-bold">🎯 Priority Actions Required!</h3>
            </div>
            <p className="mb-4 text-orange-100">
              You have {getActionableTransactions().length} transaction(s) ready for template generation and further processing.
            </p>
            <div className="flex flex-wrap gap-3">
              {getActionableTransactions().map((transaction) => (
                <button
                  key={transaction._id}
                  onClick={() => setSelectedTransaction(transaction)}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-all"
                >
                  📋 {transaction.transactionId} ({transaction.status.replace(/_/g, ' ')})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Transaction Actions */}
        {selectedTransaction && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  ⚡ Taking Action on Transaction {selectedTransaction.transactionId}
                </h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  ← Back to Overview
                </button>
              </div>
              
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Transaction Progress</span>
                  <span>{selectedTransaction.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${
                    selectedTransaction.status === 'completed' ? 'bg-green-500 w-full' :
                    selectedTransaction.status === 'templates_generated' ? 'bg-blue-500 w-3/4' :
                    selectedTransaction.status === 'submitted_to_bank' ? 'bg-purple-500 w-5/6' :
                    'bg-yellow-500 w-1/2'
                  }`}></div>
                </div>
              </div>
            </div>
            
            <ActionableWorkflow 
              transaction={selectedTransaction} 
              onRefresh={() => {
                fetchDashboardData();
                // Keep the selected transaction updated
                const updated = transactions.find(t => t._id === selectedTransaction._id);
                if (updated) {
                  setSelectedTransaction(updated);
                }
              }}
            />
          </div>
        )}

        {/* All Transactions */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">📊 All Transactions</h2>
              <div className="text-sm text-gray-600">
                Total: {transactions.length} | Ready for action: {getActionableTransactions().length}
              </div>
            </div>
          </div>
          
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500 mb-4">Upload some documents to get started with your trading workflow.</p>
              <a
                href="/upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                🚀 Upload Documents
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        📋 Transaction {transaction.transactionId}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(transaction.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {['completed', 'templates_generated', 'submitted_to_bank', 'payment_received'].includes(transaction.status) && (
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm rounded-lg font-medium transition-all"
                        >
                          ⚡ Take Action
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Documents</p>
                      <p className="text-lg font-semibold text-gray-900">{transaction.documents.length}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Supplier</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.entities?.supplier?.name || 'Not identified'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Customer</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.entities?.customer?.name || 'Not identified'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Amount</p>
                      <p className="text-sm font-bold text-gray-900">
                        {transaction.totalAmount ? `${transaction.currency} ${transaction.totalAmount}` : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {transaction.nextSuggestedActions && transaction.nextSuggestedActions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">🤖 AI Suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {transaction.nextSuggestedActions.slice(0, 3).map((action, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                            {action.description}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionableWorkflowDashboard;
