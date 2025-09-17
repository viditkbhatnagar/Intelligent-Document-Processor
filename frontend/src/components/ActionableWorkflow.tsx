import React, { useState } from 'react';

interface Transaction {
  transactionId: string;
  status: string;
  entities: any;
  documents: any[];
  totalAmount?: string;
  currency?: string;
  nextSuggestedActions: any[];
}

interface PopulatedTemplate {
  id: string;
  name: string;
  bankType: string;
  content: string;
  confidence: number;
  editableFields: EditableField[];
}

interface EditableField {
  key: string;
  label: string;
  value: string;
  type: string;
  required: boolean;
  placeholder?: string;
}

interface ActionableWorkflowProps {
  transaction: Transaction;
  onRefresh: () => void;
}

const ActionableWorkflow: React.FC<ActionableWorkflowProps> = ({ transaction, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<PopulatedTemplate[]>([]);
  const [selectedBankType, setSelectedBankType] = useState<'bank1' | 'bank2' | 'bank3'>('bank1');
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<{ [key: string]: string }>({});

  const generateTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workflow-actions/transactions/${transaction.transactionId}/generate-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bankType: selectedBankType }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate templates');
      }

      const result = await response.json();
      setTemplates(result.templates);
      setShowTemplates(true);
      
      // Advance workflow
      await advanceWorkflow('generate_templates');
      
    } catch (error) {
      console.error('Error generating templates:', error);
      alert('Failed to generate templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const advanceWorkflow = async (action: string) => {
    try {
      await fetch(`/api/workflow-actions/transactions/${transaction.transactionId}/advance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error advancing workflow:', error);
    }
  };

  const downloadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workflow-actions/transactions/${transaction.transactionId}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          bankType: selectedBankType,
          templates: templates.map(t => ({
            ...t,
            editableFields: t.editableFields.map(f => ({
              ...f,
              value: editedFields[`${t.id}_${f.key}`] || f.value
            }))
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to prepare documents');
      }

      const result = await response.json();
      
      // Download each document
      result.documents.forEach((doc: any) => {
        const blob = new Blob([doc.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
      
    } catch (error) {
      console.error('Error downloading templates:', error);
      alert('Failed to download templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const editTemplate = (templateId: string) => {
    setEditingTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const initialFields: { [key: string]: string } = {};
      template.editableFields.forEach(field => {
        initialFields[`${templateId}_${field.key}`] = field.value;
      });
      setEditedFields({ ...editedFields, ...initialFields });
    }
  };

  const saveTemplate = () => {
    setEditingTemplate(null);
    // Template is saved in editedFields state
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'quotation_received': 'bg-blue-100 text-blue-800',
      'po_issued': 'bg-purple-100 text-purple-800',
      'proforma_received': 'bg-yellow-100 text-yellow-800',
      'invoice_received': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'templates_generated': 'bg-indigo-100 text-indigo-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAvailableActions = () => {
    const actionMap: { [key: string]: Array<{ label: string, action: string, color: string }> } = {
      'completed': [
        { label: 'Generate Templates', action: 'generate_templates', color: 'bg-blue-600 hover:bg-blue-700' }
      ],
      'templates_generated': [
        { label: 'Submit to Bank', action: 'submit_to_bank', color: 'bg-green-600 hover:bg-green-700' }
      ],
      'submitted_to_bank': [
        { label: 'Payment Received', action: 'payment_received', color: 'bg-purple-600 hover:bg-purple-700' }
      ],
      'payment_received': [
        { label: 'Complete Transaction', action: 'complete_transaction', color: 'bg-green-600 hover:bg-green-700' }
      ]
    };
    
    return actionMap[transaction.status] || [
      { label: 'Generate Templates', action: 'generate_templates', color: 'bg-blue-600 hover:bg-blue-700' }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Transaction Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Transaction {transaction.transactionId}
            </h3>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          
          {transaction.totalAmount && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {transaction.currency} {transaction.totalAmount}
              </p>
              <p className="text-sm text-gray-500">Total Amount</p>
            </div>
          )}
        </div>

        {/* Documents Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Documents</p>
            <p className="text-lg font-semibold">{transaction.documents.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Supplier</p>
            <p className="text-lg font-semibold">{transaction.entities?.supplier?.name || 'Not identified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Customer</p>
            <p className="text-lg font-semibold">{transaction.entities?.customer?.name || 'Not identified'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {getAvailableActions().map((action, index) => (
            <button
              key={index}
              onClick={() => {
                if (action.action === 'generate_templates') {
                  generateTemplates();
                } else {
                  advanceWorkflow(action.action);
                }
              }}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white font-medium ${action.color} ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading && action.action === 'generate_templates' ? 'Generating...' : action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bank Format Selection */}
      {transaction.status === 'completed' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold mb-4">Select Bank Format</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'bank1', name: 'Standard Bank Format', description: 'Traditional covering letter format' },
              { id: 'bank2', name: 'Commercial Bank Format', description: 'Simplified commercial format' },
              { id: 'bank3', name: 'Trade Finance Format', description: 'Enhanced trade finance details' }
            ].map((bank) => (
              <label key={bank.id} className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="bankType"
                  value={bank.id}
                  checked={selectedBankType === bank.id}
                  onChange={(e) => setSelectedBankType(e.target.value as 'bank1' | 'bank2' | 'bank3')}
                  className="mt-1 mr-3"
                />
                <div>
                  <p className="font-medium">{bank.name}</p>
                  <p className="text-sm text-gray-600">{bank.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Generated Templates */}
      {showTemplates && templates.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Generated Templates</h4>
            <button
              onClick={downloadTemplates}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              {loading ? 'Preparing...' : 'Download All'}
            </button>
          </div>
          
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-semibold">{template.name}</h5>
                    <p className="text-sm text-gray-600">
                      Confidence: {Math.round(template.confidence * 100)}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editTemplate(template.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                    >
                      {editingTemplate === template.id ? 'Editing' : 'Edit'}
                    </button>
                  </div>
                </div>

                {/* Editable Fields */}
                {editingTemplate === template.id && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h6 className="font-medium mb-3">Edit Fields:</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {template.editableFields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type={field.type}
                            value={editedFields[`${template.id}_${field.key}`] || field.value}
                            onChange={(e) => setEditedFields({
                              ...editedFields,
                              [`${template.id}_${field.key}`]: e.target.value
                            })}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={saveTemplate}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTemplate(null)}
                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Template Content Preview */}
                <div className="bg-gray-50 rounded p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {template.content}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Actions */}
      {transaction.nextSuggestedActions && transaction.nextSuggestedActions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold mb-4">AI Suggestions</h4>
          <div className="space-y-3">
            {transaction.nextSuggestedActions.map((suggestion, index) => (
              <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-blue-900">{suggestion.description}</p>
                  <p className="text-sm text-blue-700">Priority: {suggestion.priority}</p>
                </div>
                <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                  {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionableWorkflow;
