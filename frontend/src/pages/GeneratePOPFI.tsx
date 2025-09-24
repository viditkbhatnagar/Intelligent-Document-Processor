import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Transaction {
  _id: string;
  transactionId: string;
  orderReferenceNumber: string;
  companyName: string;
  customerName: string;
  supplierName: string;
  currency: string;
  totalAmount: number;
  shipmentMethod: string;
}

interface GeneratedDocuments {
  po: {
    type: string;
    content: string;
    currency: string;
    totalAmount: number;
  };
  pfi: {
    type: string;
    content: string;
    currency: string;
    totalAmount: number;
  };
}

const GeneratePOPFI: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocuments | null>(null);
  
  const [formData, setFormData] = useState({
    shippingTerms: '',
    portName: '',
    buyerOrderReference: '',
    shipmentMethod: 'sea'
  });

  const shippingTermsOptions = [
    { value: 'EXW', label: 'EXW - Ex Works' },
    { value: 'CFR', label: 'CFR - Cost and Freight' },
    { value: 'CPT', label: 'CPT - Carriage Paid To' },
    { value: 'DAP', label: 'DAP - Delivered at Place' }
  ];

  useEffect(() => {
    if (transactionId) {
      fetchTransactionDetail();
    }
  }, [transactionId]);

  const fetchTransactionDetail = async () => {
    try {
      const response = await fetch(`/api/po-generation/transaction/${transactionId}`);
      if (response.ok) {
        const data = await response.json();
        setTransaction(data.transaction);
        // Pre-populate form with any existing data
        setFormData(prev => ({
          ...prev,
          shipmentMethod: data.transaction.shipmentMethod || 'sea',
          shippingTerms: data.transaction.shippingTerms || '',
          portName: data.transaction.portName || '',
          buyerOrderReference: data.transaction.buyerOrderReference || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast.error('Failed to fetch transaction details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!transactionId) return;

    if (!formData.shippingTerms || !formData.portName) {
      toast.error('Please fill in shipping terms and port name');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/po-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId,
          ...formData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedDocs(data);
        toast.success('PO and PFI generated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to generate documents');
      }
    } catch (error) {
      console.error('Error generating documents:', error);
      toast.error('Failed to generate documents');
    } finally {
      setGenerating(false);
    }
  };

  const handleContinueToInvoice = () => {
    navigate(`/workflow-step/${transactionId}/generate-invoice`);
  };

  const downloadDocument = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
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
          <Link to={`/transaction/${transactionId}`} className="hover:text-gray-700">
            {transaction?.orderReferenceNumber}
          </Link>
          <span className="mx-2">→</span>
          <span className="text-gray-900">Generate PO & PFI</span>
        </nav>
        
        <h1 className="text-3xl font-bold text-gray-900">Generate Purchase Order & Proforma Invoice</h1>
        <p className="text-gray-600 mt-1">Create PO for supplier and PFI for customer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Transaction Info & Form */}
        <div className="space-y-6">
          {/* Transaction Summary */}
          {transaction && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Reference:</span>
                  <span className="font-medium">{transaction.orderReferenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{transaction.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{transaction.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supplier:</span>
                  <span className="font-medium">{transaction.supplierName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{transaction.currency} {transaction.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Generation Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Document Generation Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Method *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.shipmentMethod}
                  onChange={(e) => handleInputChange('shipmentMethod', e.target.value)}
                >
                  <option value="sea">Sea (BL)</option>
                  <option value="air">Air (AWB)</option>
                  <option value="road">Road (RWB)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Payment terms will be automatically set to: 180 DAYS FROM {formData.shipmentMethod.toUpperCase() === 'SEA' ? 'BL' : formData.shipmentMethod.toUpperCase() === 'AIR' ? 'AWB' : 'RWB'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Terms *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.shippingTerms}
                  onChange={(e) => handleInputChange('shippingTerms', e.target.value)}
                >
                  <option value="">Select Shipping Terms</option>
                  {shippingTermsOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter port/destination name"
                  value={formData.portName}
                  onChange={(e) => handleInputChange('portName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Order Reference
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter buyer's order reference (optional)"
                  value={formData.buyerOrderReference}
                  onChange={(e) => handleInputChange('buyerOrderReference', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleGenerate}
                disabled={generating || !formData.shippingTerms || !formData.portName}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                {generating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  '🔄 Generate PO & PFI'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Generated Documents */}
        <div className="space-y-6">
          {generatedDocs ? (
            <>
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-green-400 text-xl mr-3">✅</div>
                  <div>
                    <h3 className="text-lg font-medium text-green-800">Documents Generated Successfully!</h3>
                    <p className="text-green-600 text-sm">PO and PFI have been created and are ready for review.</p>
                  </div>
                </div>
              </div>

              {/* Purchase Order */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">📋 Purchase Order (PO)</h3>
                      <p className="text-sm text-gray-600">For supplier in {generatedDocs.po.currency}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadDocument(generatedDocs.po.content, `PO-${transaction?.orderReferenceNumber}.txt`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600">
                      <strong>Amount:</strong> {generatedDocs.po.currency} {generatedDocs.po.totalAmount.toLocaleString()}
                    </div>
                  </div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                    {generatedDocs.po.content}
                  </pre>
                </div>
              </div>

              {/* Proforma Invoice */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">💰 Proforma Invoice (PFI)</h3>
                      <p className="text-sm text-gray-600">For customer in {generatedDocs.pfi.currency}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadDocument(generatedDocs.pfi.content, `PFI-${transaction?.orderReferenceNumber}.txt`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600">
                      <strong>Amount:</strong> {generatedDocs.pfi.currency} {generatedDocs.pfi.totalAmount.toLocaleString()}
                    </div>
                  </div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                    {generatedDocs.pfi.content}
                  </pre>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <span className="text-gray-700">Send PO to supplier for confirmation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <span className="text-gray-700">Send PFI to customer for approval</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <span className="text-gray-700">Once goods are ready, generate commercial invoice</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleContinueToInvoice}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg"
                  >
                    Continue to Invoice Generation →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Documents</h3>
              <p className="text-gray-500">
                Fill in the shipping details and click generate to create your PO and PFI documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratePOPFI;
