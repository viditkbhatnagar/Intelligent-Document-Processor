import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/Dashboard'
import DocumentUpload from './pages/DocumentUpload'
import QuotationUpload from './pages/QuotationUpload'
import DocumentProcessor from './pages/DocumentProcessor'
import WorkflowDashboard from './pages/WorkflowDashboard';
import ActionableWorkflowDashboard from './pages/ActionableWorkflowDashboard'
import WorkflowTransactions from './pages/WorkflowTransactions'
import TransactionDetail from './pages/TransactionDetail'
import GeneratePOPFI from './pages/GeneratePOPFI'
import GenerateInvoice from './pages/GenerateInvoice'
import GenerateCollection from './pages/GenerateCollection'
import ReportingDashboard from './pages/ReportingDashboard'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          
          {/* Simple Navigation */}
          <nav className="bg-white shadow mb-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center py-4">
                <Link to="/dashboard" className="text-xl font-bold text-blue-600">
                  Smart Document Analyzer
                </Link>
                <div className="space-x-4">
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link to="/workflow-transactions" className="text-gray-600 hover:text-gray-900">
                    Transactions
                  </Link>
                  <Link to="/reports" className="text-gray-600 hover:text-gray-900">
                    Reports
                  </Link>
                  <Link to="/quotation-upload" className="bg-blue-600 text-white px-4 py-2 rounded">
                    New Quotation
                  </Link>
                  <Link to="/actionable-workflow" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium">
                    ⚡ Legacy Workflow
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workflow" element={<WorkflowDashboard />} />
            <Route path="/actionable-workflow" element={<ActionableWorkflowDashboard />} />
            <Route path="/workflow-transactions" element={<WorkflowTransactions />} />
            <Route path="/transaction/:transactionId" element={<TransactionDetail />} />
            <Route path="/workflow-step/:transactionId/generate-po-pfi" element={<GeneratePOPFI />} />
            <Route path="/workflow-step/:transactionId/generate-invoice" element={<GenerateInvoice />} />
            <Route path="/workflow-step/:transactionId/generate-collection" element={<GenerateCollection />} />
            <Route path="/workflow-step/:transactionId/:status" element={<GeneratePOPFI />} />
            <Route path="/reports" element={<ReportingDashboard />} />
            <Route path="/quotation-upload" element={<QuotationUpload />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/process/:documentId" element={<DocumentProcessor />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App