import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface DocumentField {
  key: string
  value: string
  confidence: number
  type: string
}

interface ProcessedDocument {
  id: string
  originalName: string
  status: string
  documentType: string
  extractedFields: DocumentField[]
}

interface PopulatedDocument {
  templateName: string
  documentType: string
  content: string
  confidence: number
}

const DocumentProcessor = () => {
  const { documentId } = useParams<{ documentId: string }>()
  const [document, setDocument] = useState<ProcessedDocument | null>(null)
  const [populatedDocuments, setPopulatedDocuments] = useState<PopulatedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch document details
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch document')
        }
        const result = await response.json()
        setDocument(result.document)
      } catch (err) {
        setError('Failed to load document')
        console.error('Error fetching document:', err)
      } finally {
        setLoading(false)
      }
    }

    if (documentId) {
      fetchDocument()
      const interval = setInterval(fetchDocument, 3000)
      return () => clearInterval(interval)
    }
  }, [documentId])

  // Generate populated templates
  const generateTemplates = async () => {
    if (!documentId) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/populate/populate/${documentId}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to generate templates')
      }

      const result = await response.json()
      setPopulatedDocuments(result.populatedDocuments)
      toast.success('Templates generated successfully!')
    } catch (err) {
      console.error('Error generating templates:', err)
      toast.error('Failed to generate templates')
    } finally {
      setProcessing(false)
    }
  }

  // Download populated document
  const downloadDocument = async (documentType: string) => {
    if (!documentId) return

    try {
      const response = await fetch(`/api/populate/download/${documentId}/${documentType}`)
      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = `${documentType}_${documentId}.txt`
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Document downloaded!')
    } catch (err) {
      console.error('Error downloading document:', err)
      toast.error('Failed to download document')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading document...</p>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto px-4 text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-xl font-semibold mb-4">{error || 'Document not found'}</h2>
        <Link 
          to="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-6">
        <Link 
          to="/dashboard"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Document Info */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">{document.originalName}</h1>
            <p className="text-gray-600">Type: {document.documentType}</p>
          </div>
          <div className="text-right">
            {document.status === 'processed' ? (
              <span className="text-green-600 font-medium">✅ Processed</span>
            ) : (
              <span className="text-yellow-600 font-medium">⏳ Processing...</span>
            )}
          </div>
        </div>
      </div>

      {document.status === 'processed' && document.extractedFields?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Extracted Fields */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Extracted Fields</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {document.extractedFields.map((field, index) => (
                <div key={index} className="border-b border-gray-200 pb-3">
                  <p className="font-medium capitalize">
                    {field.key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-gray-600 mt-1">{field.value}</p>
                  <p className="text-sm text-gray-500">
                    {field.type} | {Math.round(field.confidence * 100)}% confidence
                  </p>
                </div>
              ))}
            </div>

            {/* Generate Templates Button */}
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={generateTemplates}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg"
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </span>
                ) : (
                  '✨ Generate Templates'
                )}
              </button>
            </div>
          </div>

          {/* Populated Templates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📄 Generated Templates</h2>
            
            {populatedDocuments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">✨</div>
                <p>Click "Generate Templates" to create populated documents</p>
              </div>
            ) : (
              <div className="space-y-4">
                {populatedDocuments.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{doc.templateName}</h3>
                        <p className="text-sm text-gray-600">
                          Confidence: {Math.round(doc.confidence * 100)}%
                        </p>
                      </div>
                      <button
                        onClick={() => downloadDocument(doc.documentType)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        📥 Download
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3 text-sm font-mono text-gray-700 max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{doc.content}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold mb-4">Processing Document</h2>
          <p className="text-gray-600 mb-4">
            Your document is being analyzed. This usually takes 30-60 seconds.
          </p>
          <div className="animate-pulse bg-gray-200 h-2 rounded-full w-64 mx-auto"></div>
        </div>
      )}
    </div>
  )
}

export default DocumentProcessor