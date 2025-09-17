import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface UploadedDocument {
  id: string
  originalName: string
  status: string
}

const DocumentUpload = () => {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      
      setUploadedDocument({
        id: result.document.id,
        originalName: result.document.originalName,
        status: result.document.status,
      })

      toast.success('Document uploaded successfully!')
      
      // Navigate to processing page
      setTimeout(() => {
        navigate(`/process/${result.document.id}`)
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6">
        <Link 
          to="/dashboard"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {!uploadedDocument ? (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-4">Upload Document</h1>
            <p className="text-gray-600">
              Upload a document (quotation, proforma invoice, purchase order, etc.) to extract fields and trigger intelligent workflow
            </p>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            {uploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-lg text-gray-600">Uploading document...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-6xl">📄</div>
                <div>
                  <label className="cursor-pointer">
                    <span className="text-lg text-blue-600 font-semibold hover:text-blue-800">
                      Click to upload your document
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.tiff"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports PDF, Word documents (.doc, .docx), text files (.txt), and images (.jpg, .png, .tiff)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Supported Formats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl mb-2">📄</div>
              <p className="text-sm font-medium">PDF</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-sm font-medium">Word</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl mb-2">📃</div>
              <p className="text-sm font-medium">Text</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl mb-2">🖼️</div>
              <p className="text-sm font-medium">Images</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm font-medium">Fast AI</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold mb-4">Upload Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your document is being processed. You'll be redirected to view the results.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm">
              <strong>File:</strong> {uploadedDocument.originalName}
            </p>
            <p className="text-sm">
              <strong>Status:</strong> {uploadedDocument.status}
            </p>
          </div>

          <Link 
            to={`/process/${uploadedDocument.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            View Processing Results
          </Link>
        </div>
      )}
    </div>
  )
}

export default DocumentUpload