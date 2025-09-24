import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Company {
  _id: string;
  name: string;
  code: string;
}

interface Customer {
  _id: string;
  name: string;
  address: string;
  contact?: string;
  email?: string;
  country?: string;
}

interface QuotationData {
  orderReferenceNumber: string;
  companyId: string;
  customerId: string;
  shipmentMethod: 'sea' | 'air' | 'road';
  shippingTerms: string;
  portName: string;
  buyerOrderReference: string;
}

const QuotationUpload: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  
  const [quotationData, setQuotationData] = useState<QuotationData>({
    orderReferenceNumber: '',
    companyId: '',
    customerId: '',
    shipmentMethod: 'sea',
    shippingTerms: '',
    portName: '',
    buyerOrderReference: ''
  });

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    address: '',
    contact: '',
    email: '',
    country: '',
    currency: 'AED'
  });

  const shippingTermsOptions = [
    { value: 'EXW', label: 'EXW - Ex Works' },
    { value: 'CFR', label: 'CFR - Cost and Freight' },
    { value: 'CPT', label: 'CPT - Carriage Paid To' },
    { value: 'DAP', label: 'DAP - Delivered at Place' }
  ];

  // Fetch companies and customers on component mount
  useEffect(() => {
    fetchCompanies();
    fetchCustomers();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/quotation/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/quotation/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleInputChange = (field: keyof QuotationData, value: string) => {
    setQuotationData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewCustomerChange = (field: string, value: string) => {
    setNewCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCustomer = async () => {
    try {
      const response = await fetch('/api/quotation/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCustomer)
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(prev => [...prev, data.customer]);
        setQuotationData(prev => ({ ...prev, customerId: data.customer._id }));
        setShowNewCustomerForm(false);
        setNewCustomer({
          name: '',
          address: '',
          contact: '',
          email: '',
          country: '',
          currency: 'AED'
        });
        toast.success('Customer created successfully');
      } else {
        toast.error('Failed to create customer');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      toast.error('Please select a quotation file');
      return;
    }

    if (!quotationData.orderReferenceNumber || !quotationData.companyId || !quotationData.customerId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderReferenceNumber', quotationData.orderReferenceNumber);
      formData.append('companyId', quotationData.companyId);
      formData.append('customerId', quotationData.customerId);
      formData.append('shipmentMethod', quotationData.shipmentMethod);
      formData.append('shippingTerms', quotationData.shippingTerms);
      formData.append('portName', quotationData.portName);
      formData.append('buyerOrderReference', quotationData.buyerOrderReference);

      const response = await fetch('/api/quotation/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Quotation uploaded successfully!');
        
        // Navigate to PO & PFI generation step
        setTimeout(() => {
          navigate(`/workflow-step/${result.document.transactionId}/generate-po-pfi`);
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload quotation');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link 
          to="/dashboard"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold">Upload Quotation</h1>
          <p className="mt-2 opacity-90">
            Start a new trading workflow by uploading a supplier quotation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Document Upload */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
                
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {file ? (
                    <div className="space-y-2">
                      <div className="text-2xl">📄</div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-4xl">📄</div>
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-blue-600 font-semibold hover:text-blue-800">
                            Click to upload quotation
                          </span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.tiff"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Supports PDF, Word, text files, and images
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                
                {/* Order Reference Number */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter order reference number"
                    value={quotationData.orderReferenceNumber}
                    onChange={(e) => handleInputChange('orderReferenceNumber', e.target.value)}
                  />
                </div>

                {/* Company Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={quotationData.companyId}
                    onChange={(e) => handleInputChange('companyId', e.target.value)}
                  >
                    <option value="">Select Company</option>
                    {companies.map(company => (
                      <option key={company._id} value={company._id}>
                        {company.name} ({company.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Customer *
                  </label>
                  {showNewCustomerForm ? (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">New Customer</h4>
                        <button
                          type="button"
                          onClick={() => setShowNewCustomerForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Customer Name *"
                          required
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newCustomer.name}
                          onChange={(e) => handleNewCustomerChange('name', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newCustomer.country}
                          onChange={(e) => handleNewCustomerChange('country', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Contact"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newCustomer.contact}
                          onChange={(e) => handleNewCustomerChange('contact', e.target.value)}
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newCustomer.email}
                          onChange={(e) => handleNewCustomerChange('email', e.target.value)}
                        />
                      </div>
                      <textarea
                        placeholder="Address *"
                        required
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCustomer.address}
                        onChange={(e) => handleNewCustomerChange('address', e.target.value)}
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={handleCreateCustomer}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Create Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewCustomerForm(false)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <select
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={quotationData.customerId}
                        onChange={(e) => handleInputChange('customerId', e.target.value)}
                      >
                        <option value="">Select Customer</option>
                        {customers.map(customer => (
                          <option key={customer._id} value={customer._id}>
                            {customer.name} - {customer.country}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewCustomerForm(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 whitespace-nowrap"
                      >
                        + New
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Shipment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Method *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={quotationData.shipmentMethod}
                  onChange={(e) => handleInputChange('shipmentMethod', e.target.value as 'sea' | 'air' | 'road')}
                >
                  <option value="sea">Sea (BL)</option>
                  <option value="air">Air (AWB)</option>
                  <option value="road">Road (RWB)</option>
                </select>
              </div>

              {/* Shipping Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Terms
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={quotationData.shippingTerms}
                  onChange={(e) => handleInputChange('shippingTerms', e.target.value)}
                >
                  <option value="">Select Terms</option>
                  {shippingTermsOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Port Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter port name"
                  value={quotationData.portName}
                  onChange={(e) => handleInputChange('portName', e.target.value)}
                />
              </div>

              {/* Buyer Order Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Order Reference
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter buyer order ref"
                  value={quotationData.buyerOrderReference}
                  onChange={(e) => handleInputChange('buyerOrderReference', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={uploading}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition duration-200"
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                'Upload Quotation & Start Workflow'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotationUpload;
