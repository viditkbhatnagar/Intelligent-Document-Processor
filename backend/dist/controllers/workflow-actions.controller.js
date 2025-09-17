"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowActionsController = void 0;
const workflow_engine_service_1 = require("../services/workflow-engine.service");
const template_auto_population_service_1 = require("../services/template-auto-population.service");
class WorkflowActionsController {
    constructor() {
        this.workflowEngine = new workflow_engine_service_1.WorkflowEngine();
        this.templateService = new template_auto_population_service_1.TemplateAutoPopulationService();
    }
    /**
     * Generate templates for a transaction
     */
    async generateTemplates(req, res) {
        try {
            const { transactionId } = req.params;
            const { bankType = 'bank1' } = req.body;
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            // Get transaction documents
            const documents = await this.workflowEngine.getTransactionDocuments(transactionId);
            if (!documents || documents.length === 0) {
                res.status(404).json({ message: 'No documents found for this transaction' });
                return;
            }
            // Generate populated templates
            const templates = await this.templateService.populateTemplatesFromTransaction(documents, bankType);
            res.json({
                success: true,
                transactionId,
                bankType,
                templates,
                message: 'Templates generated successfully'
            });
        }
        catch (error) {
            console.error('Error generating templates:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to generate templates'
            });
        }
    }
    /**
     * Update template with user edits
     */
    async updateTemplate(req, res) {
        try {
            const { templateId } = req.params;
            const { fields } = req.body;
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const updatedTemplate = await this.templateService.updateTemplateFields(templateId, fields);
            res.json({
                success: true,
                template: updatedTemplate,
                message: 'Template updated successfully'
            });
        }
        catch (error) {
            console.error('Error updating template:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update template'
            });
        }
    }
    /**
     * Download final documents
     */
    async downloadTemplates(req, res) {
        try {
            const { transactionId } = req.params;
            const { bankType = 'bank1', templates: templateData } = req.body;
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            let templates;
            if (templateData && templateData.length > 0) {
                // Use provided template data
                templates = templateData;
            }
            else {
                // Generate fresh templates
                const documents = await this.workflowEngine.getTransactionDocuments(transactionId);
                templates = await this.templateService.populateTemplatesFromTransaction(documents, bankType);
            }
            const finalDocuments = await this.templateService.generateFinalDocuments(templates);
            res.json({
                success: true,
                documents: finalDocuments,
                message: 'Documents ready for download'
            });
        }
        catch (error) {
            console.error('Error preparing documents for download:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to prepare documents'
            });
        }
    }
    /**
     * Advance workflow to next step
     */
    async advanceWorkflow(req, res) {
        try {
            const { transactionId } = req.params;
            const { action, data } = req.body;
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const transaction = await this.workflowEngine.getTransaction(transactionId, req.user.userId);
            if (!transaction) {
                res.status(404).json({ message: 'Transaction not found' });
                return;
            }
            // Update transaction based on action
            let updatedTransaction;
            switch (action) {
                case 'generate_templates':
                    updatedTransaction = await this.workflowEngine.updateTransactionStatus(transactionId, req.user.userId, 'templates_generated');
                    break;
                case 'submit_to_bank':
                    updatedTransaction = await this.workflowEngine.updateTransactionStatus(transactionId, req.user.userId, 'submitted_to_bank');
                    break;
                case 'payment_received':
                    updatedTransaction = await this.workflowEngine.updateTransactionStatus(transactionId, req.user.userId, 'payment_received');
                    break;
                case 'complete_transaction':
                    updatedTransaction = await this.workflowEngine.updateTransactionStatus(transactionId, req.user.userId, 'completed');
                    break;
                default:
                    res.status(400).json({ message: 'Invalid action' });
                    return;
            }
            res.json({
                success: true,
                transaction: updatedTransaction,
                message: `Workflow advanced: ${action}`
            });
        }
        catch (error) {
            console.error('Error advancing workflow:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to advance workflow'
            });
        }
    }
    /**
     * Get transaction details with suggested actions
     */
    async getTransactionDetails(req, res) {
        try {
            const { transactionId } = req.params;
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const transaction = await this.workflowEngine.getTransaction(transactionId, req.user.userId);
            if (!transaction) {
                res.status(404).json({ message: 'Transaction not found' });
                return;
            }
            const documents = await this.workflowEngine.getTransactionDocuments(transactionId);
            const suggestions = transaction.nextSuggestedActions || [];
            res.json({
                success: true,
                transaction,
                documents,
                suggestions,
                availableActions: this.getAvailableActions(transaction.status)
            });
        }
        catch (error) {
            console.error('Error getting transaction details:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get transaction details'
            });
        }
    }
    getAvailableActions(status) {
        const actionMap = {
            'completed': ['generate_templates', 'submit_to_bank'],
            'templates_generated': ['submit_to_bank'],
            'submitted_to_bank': ['payment_received'],
            'payment_received': ['complete_transaction']
        };
        return actionMap[status] || ['generate_templates'];
    }
    /**
     * Get supported bank formats
     */
    async getBankFormats(req, res) {
        try {
            const bankFormats = [
                {
                    id: 'bank1',
                    name: 'Standard Bank Format 1',
                    description: 'Traditional covering letter format with detailed instructions'
                },
                {
                    id: 'bank2',
                    name: 'Commercial Bank Format',
                    description: 'Simplified format for commercial collections'
                },
                {
                    id: 'bank3',
                    name: 'Trade Finance Format',
                    description: 'Enhanced format with comprehensive trade finance details'
                }
            ];
            res.json({
                success: true,
                formats: bankFormats
            });
        }
        catch (error) {
            console.error('Error getting bank formats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get bank formats'
            });
        }
    }
}
exports.WorkflowActionsController = WorkflowActionsController;
//# sourceMappingURL=workflow-actions.controller.js.map