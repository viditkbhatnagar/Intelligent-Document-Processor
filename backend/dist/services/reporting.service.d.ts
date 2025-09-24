export interface ReportSummary {
    totalTransactions: number;
    totalValue: number;
    completedTransactions: number;
    activeTransactions: number;
    byCompany: {
        [key: string]: {
            count: number;
            value: number;
        };
    };
    byCurrency: {
        [key: string]: {
            count: number;
            value: number;
        };
    };
    byStatus: {
        [key: string]: number;
    };
    recentTransactions: any[];
}
export interface ItemPriceHistory {
    itemName: string;
    purchaseDate: Date;
    unitPrice: number;
    currency: string;
    quantity: number;
    orderReferenceNumber: string;
    companyName: string;
}
export declare class ReportingService {
    /**
     * Get comprehensive report summary
     */
    getReportSummary(filters: {
        company?: string;
        dateRange?: string;
        currency?: string;
        userId?: string;
    }): Promise<ReportSummary>;
    /**
     * Get item price history
     */
    getItemPriceHistory(filters: {
        item?: string;
        company?: string;
        supplierId?: string;
        userId?: string;
        limit?: number;
    }): Promise<ItemPriceHistory[]>;
    /**
     * Get transactions by company
     */
    getTransactionsByCompany(companyCode: string, userId?: string): Promise<{
        company: string;
        transactions: {
            _id: unknown;
            transactionId: string;
            orderReferenceNumber: string | undefined;
            status: string;
            customerName: any;
            supplierName: any;
            totalAmount: number | undefined;
            currency: string | undefined;
            exchangeRate: number | undefined;
            totalAmountAED: any;
            shipmentMethod: "sea" | "air" | "road" | undefined;
            createdDate: Date;
            updatedDate: Date;
        }[];
    }>;
    /**
     * Export report data (placeholder for future implementation)
     */
    exportReport(format: 'excel' | 'pdf' | 'csv', filters: any): Promise<Buffer>;
    private generateCSV;
}
