import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Transaction {
  _id: string;
  transactionId: string;
  orderReferenceNumber: string;
  status: string;
  companyName: string;
  customerName: string;
  supplierName: string;
  currency: string;
  totalAmount: number;
  shipmentMethod: string;
  createdDate: string;
  updatedDate: string;
}

const WorkflowTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    company: 'all',
    searchTerm: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/workflow-transactions/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'quotation_received': 'bg-blue-100 text-blue-800',
      'po_issued': 'bg-yellow-100 text-yellow-800',
      'proforma_received': 'bg-purple-100 text-purple-800',
      'invoice_received': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplayName = (status: string) => {
    const names = {
      'quotation_received': 'Quotation Received',
      'po_issued': 'PO Issued',
      'proforma_received': 'Proforma Received',
      'invoice_received': 'Invoice Generated',
      'completed': 'Completed',
      'failed': 'Failed'
    };
    return names[status as keyof typeof names] || status;
  };

  const getNextAction = (status: string) => {
    const actions = {
      'quotation_received': 'Generate PO & PFI',
      'po_issued': 'Generate Invoice',
      'invoice_received': 'Generate Collection Docs',
      'completed': 'View Documents',
      'failed': 'Retry Processing'
    };
    return actions[status as keyof typeof actions] || 'View Details';
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = filter.status === 'all' || transaction.status === filter.status;
    const matchesCompany = filter.company === 'all' || transaction.companyName?.toLowerCase().includes(filter.company.toLowerCase());
    const matchesSearch = !filter.searchTerm || 
      transaction.orderReferenceNumber?.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      transaction.transactionId?.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      transaction.customerName?.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      transaction.supplierName?.toLowerCase().includes(filter.searchTerm.toLowerCase());
    
    return matchesStatus && matchesCompany && matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trading Workflow</h1>
            <p className="text-gray-600 mt-1">Manage your trading transactions and document workflow</p>
          </div>
          <Link
            to="/quotation-upload"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + New Quotation
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Order ref, transaction ID, customer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.searchTerm}
              onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Statuses</option>
              <option value="quotation_received">Quotation Received</option>
              <option value="po_issued">PO Issued</option>
              <option value="invoice_received">Invoice Generated</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.company}
              onChange={(e) => setFilter(prev => ({ ...prev, company: e.target.value }))}
            >
              <option value="all">All Companies</option>
              <option value="rock stone">Rock Stone</option>
              <option value="kinship">Kinship</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ status: 'all', company: 'all', searchTerm: '' })}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Transactions', value: transactions.length, color: 'bg-blue-500' },
          { label: 'Active', value: transactions.filter(t => !['completed', 'failed'].includes(t.status)).length, color: 'bg-yellow-500' },
          { label: 'Completed', value: transactions.filter(t => t.status === 'completed').length, color: 'bg-green-500' },
          { label: 'Failed', value: transactions.filter(t => t.status === 'failed').length, color: 'bg-red-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl`}>
                {stat.value}
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Transactions ({filteredTransactions.length})
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-4">Get started by uploading your first quotation</p>
            <Link
              to="/quotation-upload"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Upload Quotation
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <div key={transaction._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {transaction.orderReferenceNumber}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ID: {transaction.transactionId}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {getStatusDisplayName(transaction.status)}
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Company:</span>
                        <span className="ml-1 font-medium">{transaction.companyName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Customer:</span>
                        <span className="ml-1 font-medium">{transaction.customerName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="ml-1 font-medium">
                          {transaction.currency} {transaction.totalAmount?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Method:</span>
                        <span className="ml-1 font-medium capitalize">{transaction.shipmentMethod || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-500">
                      Created: {new Date(transaction.createdDate).toLocaleDateString()}
                      {transaction.updatedDate !== transaction.createdDate && (
                        <span className="ml-4">
                          Updated: {new Date(transaction.updatedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/transaction/${transaction.transactionId}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/workflow-step/${transaction.transactionId}/${transaction.status}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      {getNextAction(transaction.status)}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowTransactions;
