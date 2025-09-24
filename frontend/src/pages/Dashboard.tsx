import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Intelligent Trading Company Workflow
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload documents → AI classifies & links them → Track complete business transactions
        </p>
        
        <div className="space-x-4">
          <Link 
            to="/quotation-upload"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg"
          >
            📄 Upload New Quotation
          </Link>
          <Link 
            to="/workflow-transactions"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg"
          >
            📊 View Transactions
          </Link>
          <Link 
            to="/reports"
            className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg"
          >
            📋 View Reports
          </Link>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-blue-600">1</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Quotation</h3>
          <p className="text-gray-600">Supplier price quotation</p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-purple-600">2</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload PO</h3>
          <p className="text-gray-600">Purchase order confirmation</p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-yellow-600">3</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Proforma</h3>
          <p className="text-gray-600">Proforma invoice from supplier</p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-orange-600">4</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Invoice</h3>
          <p className="text-gray-600">Commercial/tax invoice</p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-green-600">5</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Packing List</h3>
          <p className="text-gray-600">Complete the transaction</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">📤 Upload Process</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Upload documents one by one in order</li>
              <li>• AI automatically classifies each document type</li>
              <li>• System extracts company and transaction details</li>
              <li>• Related documents get linked into transactions</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-600">📊 Workflow Tracking</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Real-time status tracking in workflow dashboard</li>
              <li>• Smart suggestions for next actions</li>
              <li>• Complete audit trail and entity mapping</li>
              <li>• Automatic workflow progression</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-semibold mb-6">What You Get</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Covering Letter</h3>
            <p className="text-gray-600">Bank collection letter with extracted data</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Bill of Exchange</h3>
            <p className="text-gray-600">Trade document with invoice details</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Smart Extraction</h3>
            <p className="text-gray-600">AI identifies key fields automatically</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Instant Download</h3>
            <p className="text-gray-600">Get populated documents immediately</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard