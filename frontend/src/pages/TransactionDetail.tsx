import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface TransactionDetail {
  _id: string;
  transactionId: string;
  orderReferenceNumber: string;
  status: string;
  companyName: string;
  customerName: string;
  supplierName: string;
  currency: string;
  totalAmount: number;
  exchangeRate?: number;
  totalAmountAED?: number;
  shipmentMethod: string;
  shippingTerms: string;
  portName: string;
  buyerOrderReference: string;
  paymentTerms: string | { type: string; description: string; daysFromShipping?: number } | null;
  createdDate: string;
  updatedDate: string;
  documents: TransactionDocument[];
  entities: any;
}

interface TransactionDocument {
  documentId: string;
  documentType: string;
  uploadDate: string;
  status: string;
  role: 'source' | 'generated' | 'received';
}

const TransactionDetail: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionId) {
      fetchTransactionDetail();
    }
  }, [transactionId]);

  const fetchTransactionDetail = async () => {
    try {
      const response = await fetch(`/api/workflow-transactions/transactions/${transactionId}`);
      if (response.ok) {
        const data = await response.json();
        setTransaction(data.transaction);
      } else {
        setError('Transaction not found');
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      setError('Failed to fetch transaction details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'quotation_received': 'bg-blue-100 text-blue-800 border-blue-200',
      'po_issued': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'proforma_received': 'bg-purple-100 text-purple-800 border-purple-200',
      'invoice_received': 'bg-orange-100 text-orange-800 border-orange-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'failed': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDocumentIcon = (documentType: string) => {
    const icons = {
      'quotation': '💰',
      'purchase_order': '📋',
      'proforma_invoice': '📄',
      'commercial_invoice': '🧾',
      'invoice': '🧾',
      'packing_list': '📦',
      'bill_of_lading': '🚢',
      'airway_bill': '✈️',
      'road_way_bill': '🚛',
      'transport_document': '🚚',
      'covering_letter': '📨',
      'bill_of_exchange': '💳'
    };
    return icons[documentType as keyof typeof icons] || '📄';
  };

  const getNextSteps = (status: string) => {
    const steps = {
      'quotation_received': [
        { action: 'Generate PO & PFI', link: `/workflow-step/${transactionId}/generate-po-pfi`, primary: true },
        { action: 'View Documents', link: `/documents/${transactionId}`, primary: false }
      ],
      'po_issued': [
        { action: 'Generate Invoice', link: `/workflow-step/${transactionId}/generate-invoice`, primary: true },
        { action: 'View PO & PFI', link: `/documents/${transactionId}`, primary: false }
      ],
      'invoice_received': [
        { action: 'Generate Collection Docs', link: `/workflow-step/${transactionId}/generate-collection`, primary: true },
        { action: 'View Invoice', link: `/documents/${transactionId}`, primary: false }
      ],
      'completed': [
        { action: 'View All Documents', link: `/documents/${transactionId}`, primary: true },
        { action: 'Generate Report', link: `/reports/${transactionId}`, primary: false }
      ]
    };
    return steps[status as keyof typeof steps] || [];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction Not Found</h3>
          <p className="text-gray-500 mb-4">{error || 'The requested transaction could not be found'}</p>
          <Link
            to="/workflow"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Workflow
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/workflow" className="hover:text-gray-700">Workflow</Link>
          <span className="mx-2">→</span>
          <span className="text-gray-900">{transaction.orderReferenceNumber}</span>
        </nav>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{transaction.orderReferenceNumber}</h1>
            <p className="text-gray-600 mt-1">Transaction ID: {transaction.transactionId}</p>
            <div className="mt-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(transaction.status)}`}>
                {transaction.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {getNextSteps(transaction.status).map((step, index) => (
              <Link
                key={index}
                to={step.link}
                className={`px-4 py-2 rounded-lg font-medium ${
                  step.primary
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {step.action}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Company</label>
                <p className="text-base text-gray-900">{transaction.companyName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Customer</label>
                <p className="text-base text-gray-900">{transaction.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Supplier</label>
                <p className="text-base text-gray-900">{transaction.supplierName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Shipment Method</label>
                <p className="text-base text-gray-900 capitalize">{transaction.shipmentMethod}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Shipping Terms</label>
                <p className="text-base text-gray-900">{transaction.shippingTerms} {transaction.portName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Buyer Order Ref</label>
                <p className="text-base text-gray-900">{transaction.buyerOrderReference || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Amount</label>
                <p className="text-base text-gray-900">
                  {transaction.currency} {transaction.totalAmount?.toLocaleString()}
                  {transaction.exchangeRate && transaction.totalAmountAED && (
                    <span className="text-sm text-gray-500 ml-2">
                      (AED {transaction.totalAmountAED.toLocaleString()})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Payment Terms</label>
                <p className="text-base text-gray-900">
                  {typeof transaction.paymentTerms === 'string' 
                    ? transaction.paymentTerms 
                    : transaction.paymentTerms?.description || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
            {transaction.documents && transaction.documents.length > 0 ? (
              <div className="space-y-3">
                {transaction.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getDocumentIcon(doc.documentType)}</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {doc.documentType.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {doc.role.charAt(0).toUpperCase() + doc.role.slice(1)} • 
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        doc.status === 'processed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No documents available</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              {[
                { step: 'quotation_received', title: 'Quotation Received', completed: true },
                { step: 'po_issued', title: 'PO & PFI Generated', completed: ['po_issued', 'invoice_received', 'completed'].includes(transaction.status) },
                { step: 'invoice_received', title: 'Invoice Generated', completed: ['invoice_received', 'completed'].includes(transaction.status) },
                { step: 'completed', title: 'Collection Documents', completed: transaction.status === 'completed' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.completed ? 'bg-green-500' : 
                    transaction.status === item.step ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-sm ${
                    item.completed ? 'text-gray-900 font-medium' : 
                    transaction.status === item.step ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Entity Information */}
          {transaction.entities && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                {transaction.entities.supplier && (
                  <div>
                    <h4 className="font-medium text-gray-900">Supplier</h4>
                    <p className="text-sm text-gray-600">{transaction.entities.supplier.name}</p>
                    {transaction.entities.supplier.email && (
                      <p className="text-xs text-gray-500">{transaction.entities.supplier.email}</p>
                    )}
                  </div>
                )}
                {transaction.entities.customer && (
                  <div>
                    <h4 className="font-medium text-gray-900">Customer</h4>
                    <p className="text-sm text-gray-600">{transaction.entities.customer.name}</p>
                    {transaction.entities.customer.email && (
                      <p className="text-xs text-gray-500">{transaction.entities.customer.email}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                📧 Send Update Email
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                📋 Copy Transaction ID
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                📊 Generate Report
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                🗑️ Archive Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
