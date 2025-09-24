import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ReportSummary {
  totalTransactions: number;
  totalValue: number;
  completedTransactions: number;
  activeTransactions: number;
  byCompany: {
    [key: string]: {
      count: number;
      value: number;
    };
  };
  byCurrency: {
    [key: string]: {
      count: number;
      value: number;
    };
  };
  byStatus: {
    [key: string]: number;
  };
  recentTransactions: RecentTransaction[];
}

interface RecentTransaction {
  _id: string;
  transactionId: string;
  orderReferenceNumber: string;
  status: string;
  companyName: string;
  customerName: string;
  totalAmount: number;
  currency: string;
  createdDate: string;
}

interface ItemPriceHistory {
  itemName: string;
  purchaseDate: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  orderReferenceNumber: string;
  companyName: string;
}

const ReportingDashboard: React.FC = () => {
  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [priceHistory, setPriceHistory] = useState<ItemPriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'analytics'>('overview');
  const [filters, setFilters] = useState({
    company: 'all',
    dateRange: '30days',
    currency: 'all',
    searchItem: ''
  });

  useEffect(() => {
    fetchReportData();
    if (activeTab === 'items') {
      fetchItemPriceHistory();
    }
  }, [activeTab, filters]);

  const fetchReportData = async () => {
    try {
      const queryParams = new URLSearchParams({
        company: filters.company,
        dateRange: filters.dateRange,
        currency: filters.currency
      });

      const response = await fetch(`/api/reporting/summary?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemPriceHistory = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.searchItem) queryParams.append('item', filters.searchItem);
      if (filters.company !== 'all') queryParams.append('company', filters.company);

      const response = await fetch(`/api/reporting/item-history?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setPriceHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'AED') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'quotation_received': 'bg-blue-100 text-blue-800',
      'po_issued': 'bg-yellow-100 text-yellow-800',
      'invoice_received': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Trading Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive reporting for your trading operations</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.company}
              onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
            >
              <option value="all">All Companies</option>
              <option value="rock stone">Rock Stone</option>
              <option value="kinship">Kinship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.currency}
              onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
            >
              <option value="all">All Currencies</option>
              <option value="AED">AED</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          {activeTab === 'items' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Item</label>
              <input
                type="text"
                placeholder="Item name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.searchItem}
                onChange={(e) => setFilters(prev => ({ ...prev, searchItem: e.target.value }))}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'items', label: 'Item Price History', icon: '📈' },
              { id: 'analytics', label: 'Analytics', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {reportData.totalTransactions}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-lg font-semibold text-gray-900">{reportData.totalTransactions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {reportData.completedTransactions}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-lg font-semibold text-gray-900">{reportData.completedTransactions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {reportData.activeTransactions}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-lg font-semibold text-gray-900">{reportData.activeTransactions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  AED
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(reportData.totalValue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Company */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">By Company</h3>
              <div className="space-y-4">
                {Object.entries(reportData.byCompany).map(([company, data]) => (
                  <div key={company} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{company}</div>
                      <div className="text-sm text-gray-500">{data.count} transactions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatCurrency(data.value)}</div>
                      <div className="text-sm text-gray-500">
                        {((data.count / reportData.totalTransactions) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Currency */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">By Currency</h3>
              <div className="space-y-4">
                {Object.entries(reportData.byCurrency).map(([currency, data]) => (
                  <div key={currency} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{currency}</div>
                      <div className="text-sm text-gray-500">{data.count} transactions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatCurrency(data.value, currency)}</div>
                      <div className="text-sm text-gray-500">
                        {((data.count / reportData.totalTransactions) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {reportData.recentTransactions.map((transaction) => (
                <div key={transaction._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/transaction/${transaction.transactionId}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {transaction.orderReferenceNumber}
                        </Link>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                        <span>{transaction.companyName}</span>
                        <span>{transaction.customerName}</span>
                        <span>{formatCurrency(transaction.totalAmount, transaction.currency)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Item Price History Tab */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Item Price History</h3>
              <p className="text-sm text-gray-600">Track pricing trends for purchased items</p>
            </div>
            
            {priceHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Price History Available</h3>
                <p className="text-gray-500">
                  {filters.searchItem 
                    ? `No price history found for "${filters.searchItem}"`
                    : 'No item purchase history available'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {priceHistory.map((item, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.itemName}</div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                          <span>{item.companyName}</span>
                          <span>{item.orderReferenceNumber}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(item.unitPrice, item.currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(item.purchaseDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && reportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Status Distribution</h3>
              <div className="space-y-3">
                {Object.entries(reportData.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
                        {status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{count}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / reportData.totalTransactions) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {((count / reportData.totalTransactions) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">
                    {((reportData.completedTransactions / reportData.totalTransactions) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Transaction Value</span>
                  <span className="font-medium">
                    {formatCurrency(reportData.totalValue / reportData.totalTransactions)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Transactions</span>
                  <span className="font-medium">{reportData.activeTransactions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Reports</h3>
            <div className="flex space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                📊 Export to Excel
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
                📄 Export to PDF
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium">
                💾 Export to CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportingDashboard;
