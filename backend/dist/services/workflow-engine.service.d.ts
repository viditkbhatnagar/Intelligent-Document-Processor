import { ProcessedDocument } from '../types/document.types';
export declare class WorkflowEngine {
    private aiService;
    private workflowSteps;
    /**
     * Process a newly uploaded document and determine workflow actions
     */
    processDocumentWorkflow(document: ProcessedDocument): Promise<any | null>;
    /**
     * Find existing transaction that this document might belong to
     */
    private findRelatedTransaction;
    /**
     * Check if documents are related based on business entities
     */
    private areDocumentsRelated;
    private extractCompanyName;
    private extractFieldValue;
    private normalizeCompanyName;
    /**
     * Create new transaction from document
     */
    private createNewTransaction;
    /**
     * Update existing transaction with new document
     */
    private updateExistingTransaction;
    /**
     * Determine initial workflow step based on document type
     */
    private determineInitialWorkflowStep;
    /**
     * Check if workflow should advance based on new document
     */
    private shouldAdvanceWorkflow;
    /**
     * Generate intelligent workflow suggestions
     */
    private generateWorkflowSuggestions;
    /**
     * Extract entities from document using AI
     */
    private extractEntitiesFromDocument;
    /**
     * Get transaction documents (public method for controllers)
     */
    getTransactionDocuments(transactionId: string): Promise<ProcessedDocument[]>;
    /**
     * Get transaction documents (private helper method)
     */
    private getTransactionDocumentsInternal;
    /**
     * Convert workflow step to transaction status
     */
    private getStatusFromStep;
    /**
     * Get all transactions for a user
     */
    getUserTransactions(userId: string): Promise<any[]>;
    /**
     * Get transaction by ID
     */
    getTransaction(transactionId: string, userId: string): Promise<any | null>;
    /**
     * Update transaction manually
     */
    updateTransactionStatus(transactionId: string, userId: string, status: string, notes?: string): Promise<any | null>;
}
