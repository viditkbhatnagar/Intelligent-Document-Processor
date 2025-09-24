import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface InvoiceItem {
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  selected?: boolean;
}

interface AvailableItemsData {
  items: InvoiceItem[];
  currency: string;
  totalAmount: number;
  banks: string[];
}

interface GeneratedInvoice {
  invoiceNumber: string;
  content: string;
  currency: string;
  totalAmount: number;
  items: InvoiceItem[];
  bankName: string;
  isPartialShipment: boolean;
}

const GenerateInvoice: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [availableData, setAvailableData] = useState<AvailableItemsData | null>(null);
  const [generatedInvoice, setGeneratedInvoice] = useState<GeneratedInvoice | null>(null);
  
  const [formData, setFormData] = useState({
    shipmentType: 'full' as 'full' | 'partial',
    bankName: '',
    selectedItems: [] as InvoiceItem[]
  });

  useEffect(() => {
    if (transactionId) {
      fetchAvailableItems();
    }
  }, [transactionId]);

  const fetchAvailableItems = async () => {
    try {
      const response = await fetch(`/api/invoice-generation/items/${transactionId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableData(data);
        if (data.banks.length > 0) {
          setFormData(prev => ({ ...prev, bankName: data.banks[0] }));
        }
        // Initialize all items as selected for full shipment
        setFormData(prev => ({
          ...prev,
          selectedItems: data.items.map((item: InvoiceItem) => ({ ...item, selected: true }))
        }));
      } else {
        toast.error('Failed to fetch available items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to fetch available items');
    } finally {
      setLoading(false);
    }
  };

  const handleShipmentTypeChange = (type: 'full' | 'partial') => {
    setFormData(prev => ({
      ...prev,
      shipmentType: type,
      selectedItems: type === 'full' 
        ? prev.selectedItems.map(item => ({ ...item, selected: true }))
        : prev.selectedItems.map(item => ({ ...item, selected: false }))
    }));
  };

  const handleItemSelection = (index: number, selected: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.map((item, i) => 
        i === index ? { ...item, selected } : item
      )
    }));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.map((item, i) => 
        i === index 
          ? { 
              ...item, 
              quantity: Math.max(0, Math.min(quantity, availableData?.items[i]?.quantity || 0)),
              totalPrice: quantity * item.unitPrice
            } 
          : item
      )
    }));
  };

  const getSelectedItems = () => {
    return formData.selectedItems.filter(item => item.selected && item.quantity > 0);
  };

  const getSelectedTotal = () => {
    return getSelectedItems().reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleGenerate = async () => {
    if (!transactionId) return;

    if (!formData.bankName) {
      toast.error('Please select a bank');
      return;
    }

    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/invoice-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId,
          shipmentType: formData.shipmentType,
          bankName: formData.bankName,
          selectedItems: formData.shipmentType === 'partial' ? selectedItems : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedInvoice(data.invoice);
        toast.success(`${formData.shipmentType === 'partial' ? 'Partial' : 'Full'} shipment invoice generated successfully!`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handleContinueToCollection = () => {
    navigate(`/workflow-step/${transactionId}/generate-collection`);
  };

  const downloadInvoice = () => {
    if (!generatedInvoice) return;
    
    const blob = new Blob([generatedInvoice.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedInvoice.invoiceNumber}.txt`;
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

  if (!availableData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500 mb-4">Unable to load invoice data for this transaction</p>
          <Link
            to={`/transaction/${transactionId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Transaction
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
          <Link to={`/transaction/${transactionId}`} className="hover:text-gray-700">Transaction</Link>
          <span className="mx-2">→</span>
          <span className="text-gray-900">Generate Invoice</span>
        </nav>
        
        <h1 className="text-3xl font-bold text-gray-900">Generate Commercial Invoice</h1>
        <p className="text-gray-600 mt-1">Create invoice for full or partial shipment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Shipment Type */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipment Type</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="full"
                  name="shipmentType"
                  checked={formData.shipmentType === 'full'}
                  onChange={() => handleShipmentTypeChange('full')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="full" className="flex-1">
                  <div className="font-medium text-gray-900">Full Shipment</div>
                  <div className="text-sm text-gray-500">Invoice for all items in the order</div>
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="partial"
                  name="shipmentType"
                  checked={formData.shipmentType === 'partial'}
                  onChange={() => handleShipmentTypeChange('partial')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="partial" className="flex-1">
                  <div className="font-medium text-gray-900">Partial Shipment</div>
                  <div className="text-sm text-gray-500">Invoice for selected items only</div>
                </label>
              </div>
            </div>
          </div>

          {/* Bank Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Selection</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Bank *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.bankName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
              >
                {availableData.banks.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Bank information will be included in the invoice
              </p>
            </div>
          </div>

          {/* Items Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items to Invoice</h3>
              <div className="text-sm text-gray-600">
                Total: {availableData.currency} {availableData.totalAmount.toLocaleString()}
              </div>
            </div>

            <div className="space-y-4">
              {formData.selectedItems.map((item, index) => (
                <div key={index} className={`p-4 border rounded-lg ${
                  formData.shipmentType === 'partial' 
                    ? item.selected ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    : 'border-green-200 bg-green-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    {formData.shipmentType === 'partial' && (
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => handleItemSelection(index, e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.itemName}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                      
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Quantity
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max={availableData.items[index]?.quantity || 0}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                              disabled={formData.shipmentType === 'full'}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                            <span className="text-xs text-gray-500">
                              / {availableData.items[index]?.quantity} {item.unit}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Total Amount
                          </label>
                          <div className="text-sm font-medium text-gray-900">
                            {availableData.currency} {item.totalPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">
                  Selected Items Total:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {availableData.currency} {getSelectedTotal().toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {getSelectedItems().length} of {availableData.items.length} items selected
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGenerate}
                disabled={generating || getSelectedItems().length === 0 || !formData.bankName}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                {generating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Invoice...</span>
                  </div>
                ) : (
                  `🧾 Generate ${formData.shipmentType === 'partial' ? 'Partial' : 'Full'} Invoice`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Generated Invoice */}
        <div className="space-y-6">
          {generatedInvoice ? (
            <>
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-green-400 text-xl mr-3">✅</div>
                  <div>
                    <h3 className="text-lg font-medium text-green-800">Invoice Generated Successfully!</h3>
                    <p className="text-green-600 text-sm">
                      {generatedInvoice.isPartialShipment ? 'Partial shipment' : 'Full shipment'} invoice is ready.
                    </p>
                  </div>
                </div>
              </div>

              {/* Generated Invoice */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">🧾 Commercial Invoice</h3>
                      <p className="text-sm text-gray-600">
                        {generatedInvoice.invoiceNumber} • {generatedInvoice.bankName}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={downloadInvoice}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Amount:</strong> {generatedInvoice.currency} {generatedInvoice.totalAmount.toLocaleString()}
                      </div>
                      <div>
                        <strong>Items:</strong> {generatedInvoice.items.length} items
                      </div>
                      <div>
                        <strong>Type:</strong> {generatedInvoice.isPartialShipment ? 'Partial Shipment' : 'Full Shipment'}
                      </div>
                      <div>
                        <strong>Bank:</strong> {generatedInvoice.bankName}
                      </div>
                    </div>
                  </div>
                  
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                    {generatedInvoice.content}
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
                    <span className="text-gray-700">Prepare goods for shipment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <span className="text-gray-700">Obtain transport document (BL/AWB/RWB)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <span className="text-gray-700">Generate collection documents for bank</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleContinueToCollection}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg"
                  >
                    Continue to Collection Documents →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-6xl mb-4">🧾</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Invoice</h3>
              <p className="text-gray-500">
                Select your items, shipment type, and bank, then click generate to create the commercial invoice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateInvoice;
