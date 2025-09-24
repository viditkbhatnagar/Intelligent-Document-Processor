import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface BankOption {
  code: string;
  name: string;
}

interface TransportDocumentData {
  documentNumber: string;
  documentDate: string;
  documentType: string;
}

interface CollectionDocument {
  type: 'covering_letter' | 'bill_of_exchange';
  content: string;
  bankName: string;
}

interface GeneratedCollection {
  coveringLetter: CollectionDocument;
  billOfExchange: CollectionDocument;
  transportDocument: TransportDocumentData;
}

const GenerateCollection: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedCollection | null>(null);
  const [transportFile, setTransportFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    bankName: '',
    invoiceNumber: '',
    invoiceAmount: '',
    currency: 'AED'
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await fetch('/api/collection-documents/banks');
      if (response.ok) {
        const data = await response.json();
        setBanks(data.banks);
        if (data.banks.length > 0) {
          setFormData(prev => ({ ...prev, bankName: data.banks[0].code }));
        }
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast.error('Failed to fetch banks list');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTransportFile(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!transactionId) return;

    if (!transportFile) {
      toast.error('Please upload a transport document');
      return;
    }

    if (!formData.bankName || !formData.invoiceNumber || !formData.invoiceAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setGenerating(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('transportDocument', transportFile);
      formDataToSend.append('transactionId', transactionId);
      formDataToSend.append('bankName', formData.bankName);
      formDataToSend.append('invoiceNumber', formData.invoiceNumber);
      formDataToSend.append('invoiceAmount', formData.invoiceAmount);
      formDataToSend.append('currency', formData.currency);

      const response = await fetch('/api/collection-documents/generate', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedDocs(data);
        toast.success('Collection documents generated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to generate collection documents');
      }
    } catch (error) {
      console.error('Error generating collection documents:', error);
      toast.error('Failed to generate collection documents');
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteWorkflow = () => {
    toast.success('🎉 Trading workflow completed successfully!');
    navigate('/workflow');
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
          <Link to={`/transaction/${transactionId}`} className="hover:text-gray-700">Transaction</Link>
          <span className="mx-2">→</span>
          <span className="text-gray-900">Generate Collection Documents</span>
        </nav>
        
        <h1 className="text-3xl font-bold text-gray-900">Generate Collection Documents</h1>
        <p className="text-gray-600 mt-1">Create covering letter and bill of exchange for bank collection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Bank Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Selection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bank *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                >
                  <option value="">Select Bank</option>
                  {banks.map(bank => (
                    <option key={bank.code} value={bank.code}>
                      {bank.code} - {bank.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Bank-specific templates will be used for collection documents
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter invoice number"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Amount *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    value={formData.invoiceAmount}
                    onChange={(e) => handleInputChange('invoiceAmount', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  >
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Transport Document Upload */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transport Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Transport Document *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {transportFile ? (
                    <div className="space-y-1 text-center">
                      <div className="text-4xl">📄</div>
                      <div className="flex text-sm text-gray-600">
                        <div className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <p>{transportFile.name}</p>
                          <p className="text-xs text-gray-400">
                            {(transportFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <input 
                            type="file" 
                            className="sr-only"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.tiff"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => setTransportFile(null)}
                          className="text-sm text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                        <span className="text-gray-300">|</span>
                        <label className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
                          Replace
                          <input 
                            type="file" 
                            className="sr-only"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.tiff"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <div className="text-4xl">🚚</div>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="transport-file" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload transport document</span>
                          <input 
                            id="transport-file" 
                            name="transport-file" 
                            type="file" 
                            className="sr-only"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.tiff"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        BL, AWB, RWB, PDF, DOC, TXT, Images up to 10MB
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Upload the Bill of Lading (BL), Air Way Bill (AWB), or Road Way Bill (RWB) to extract document details
                </p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <button
              onClick={handleGenerate}
              disabled={generating || !transportFile || !formData.bankName || !formData.invoiceNumber || !formData.invoiceAmount}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              {generating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Documents...</span>
                </div>
              ) : (
                '📨 Generate Collection Documents'
              )}
            </button>
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
                    <h3 className="text-lg font-medium text-green-800">Collection Documents Generated!</h3>
                    <p className="text-green-600 text-sm">
                      Covering letter and bill of exchange are ready for {generatedDocs.coveringLetter.bankName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transport Document Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Transport Document Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Document Type:</span>
                    <span className="ml-2 font-medium">{generatedDocs.transportDocument.documentType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Document Number:</span>
                    <span className="ml-2 font-medium">{generatedDocs.transportDocument.documentNumber}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Document Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(generatedDocs.transportDocument.documentDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Covering Letter */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">📨 Covering Letter</h3>
                      <p className="text-sm text-gray-600">For {generatedDocs.coveringLetter.bankName}</p>
                    </div>
                    <button
                      onClick={() => downloadDocument(generatedDocs.coveringLetter.content, `Covering-Letter-${formData.invoiceNumber}.txt`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
                    {generatedDocs.coveringLetter.content}
                  </pre>
                </div>
              </div>

              {/* Bill of Exchange */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">💳 Bill of Exchange</h3>
                      <p className="text-sm text-gray-600">For {generatedDocs.billOfExchange.bankName}</p>
                    </div>
                    <button
                      onClick={() => downloadDocument(generatedDocs.billOfExchange.content, `Bill-of-Exchange-${formData.invoiceNumber}.txt`)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
                    {generatedDocs.billOfExchange.content}
                  </pre>
                </div>
              </div>

              {/* Workflow Complete */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Trading Workflow Complete!</h3>
                  <p className="text-gray-600 mb-6">
                    All documents have been generated successfully. Your trading transaction is now complete.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</div>
                      <span className="text-gray-700">Quotation processed</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</div>
                      <span className="text-gray-700">PO & PFI generated</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</div>
                      <span className="text-gray-700">Invoice created</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</div>
                      <span className="text-gray-700">Collection documents ready</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 justify-center">
                    <Link
                      to={`/transaction/${transactionId}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      View Transaction Details
                    </Link>
                    <button
                      onClick={handleCompleteWorkflow}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Complete & Return to Workflow
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-6xl mb-4">📨</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Collection Documents</h3>
              <p className="text-gray-500">
                Upload your transport document, select a bank, and provide invoice details to generate collection documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateCollection;
