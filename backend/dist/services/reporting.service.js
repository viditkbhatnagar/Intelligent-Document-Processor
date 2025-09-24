"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = void 0;
const BusinessTransaction_1 = require("../models/BusinessTransaction");
const PurchaseHistory_1 = require("../models/PurchaseHistory");
const Company_1 = require("../models/Company");
const mongoose_1 = __importDefault(require("mongoose"));
class ReportingService {
    /**
     * Get comprehensive report summary
     */
    async getReportSummary(filters) {
        try {
            // Build query based on filters
            const query = {};
            if (filters.userId) {
                query.userId = filters.userId;
            }
            // Date range filter
            if (filters.dateRange && filters.dateRange !== 'all') {
                const now = new Date();
                let startDate;
                switch (filters.dateRange) {
                    case '7days':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '30days':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case '90days':
                        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        break;
                    case '1year':
                        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        startDate = new Date(0);
                }
                query.createdDate = { $gte: startDate };
            }
            // Company filter
            if (filters.company && filters.company !== 'all') {
                const company = await Company_1.CompanyModel.findOne({
                    name: { $regex: new RegExp(filters.company, 'i') },
                    isActive: true
                });
                if (company) {
                    query.companyId = company._id;
                }
            }
            // Currency filter
            if (filters.currency && filters.currency !== 'all') {
                query.currency = filters.currency;
            }
            // Get all transactions matching criteria
            const transactions = await BusinessTransaction_1.BusinessTransactionModel.find(query)
                .populate('companyId', 'name')
                .populate('customerId', 'name')
                .populate('supplierId', 'name')
                .sort({ createdDate: -1 });
            // Calculate summary statistics
            const totalTransactions = transactions.length;
            const completedTransactions = transactions.filter(t => t.status === 'completed').length;
            const activeTransactions = transactions.filter(t => !['completed', 'failed'].includes(t.status)).length;
            const totalValue = transactions.reduce((sum, t) => {
                if (t.totalAmountAED)
                    return sum + t.totalAmountAED;
                if (t.totalAmount && t.exchangeRate)
                    return sum + (t.totalAmount * t.exchangeRate);
                return sum + (t.totalAmount || 0);
            }, 0);
            // Group by company
            const byCompany = {};
            transactions.forEach(t => {
                const companyName = t.companyId?.name || 'Unknown';
                if (!byCompany[companyName]) {
                    byCompany[companyName] = { count: 0, value: 0 };
                }
                byCompany[companyName].count++;
                let value = 0;
                if (t.totalAmountAED)
                    value = t.totalAmountAED;
                else if (t.totalAmount && t.exchangeRate)
                    value = t.totalAmount * t.exchangeRate;
                else
                    value = t.totalAmount || 0;
                byCompany[companyName].value += value;
            });
            // Group by currency
            const byCurrency = {};
            transactions.forEach(t => {
                const currency = t.currency || 'Unknown';
                if (!byCurrency[currency]) {
                    byCurrency[currency] = { count: 0, value: 0 };
                }
                byCurrency[currency].count++;
                byCurrency[currency].value += t.totalAmount || 0;
            });
            // Group by status
            const byStatus = {};
            transactions.forEach(t => {
                const status = t.status || 'unknown';
                byStatus[status] = (byStatus[status] || 0) + 1;
            });
            // Get recent transactions (last 10)
            const recentTransactions = transactions.slice(0, 10).map(t => ({
                _id: t._id,
                transactionId: t.transactionId,
                orderReferenceNumber: t.orderReferenceNumber,
                status: t.status,
                companyName: t.companyId?.name || 'Unknown',
                customerName: t.customerId?.name || 'Unknown',
                supplierName: t.supplierId?.name,
                totalAmount: t.totalAmount,
                currency: t.currency,
                createdDate: t.createdDate,
                updatedDate: t.updatedDate
            }));
            return {
                totalTransactions,
                totalValue,
                completedTransactions,
                activeTransactions,
                byCompany,
                byCurrency,
                byStatus,
                recentTransactions
            };
        }
        catch (error) {
            console.error('Error generating report summary:', error);
            throw new Error('Failed to generate report summary');
        }
    }
    /**
     * Get item price history
     */
    async getItemPriceHistory(filters) {
        try {
            const query = {};
            if (filters.userId) {
                query.createdBy = filters.userId;
            }
            if (filters.item) {
                query['items.itemName'] = { $regex: new RegExp(filters.item, 'i') };
            }
            if (filters.company) {
                const company = await Company_1.CompanyModel.findOne({
                    name: { $regex: new RegExp(filters.company, 'i') },
                    isActive: true
                });
                if (company) {
                    query.companyId = company._id;
                }
            }
            if (filters.supplierId) {
                query.supplierId = new mongoose_1.default.Types.ObjectId(filters.supplierId);
            }
            const history = await PurchaseHistory_1.PurchaseHistoryModel.aggregate([
                { $match: query },
                { $unwind: '$items' },
                {
                    $match: filters.item
                        ? { 'items.itemName': { $regex: new RegExp(filters.item, 'i') } }
                        : {}
                },
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'companyId',
                        foreignField: '_id',
                        as: 'company'
                    }
                },
                {
                    $project: {
                        itemName: '$items.itemName',
                        purchaseDate: 1,
                        unitPrice: '$items.unitPrice',
                        currency: 1,
                        quantity: '$items.quantity',
                        orderReferenceNumber: 1,
                        companyName: { $arrayElemAt: ['$company.name', 0] }
                    }
                },
                { $sort: { purchaseDate: -1 } },
                { $limit: filters.limit || 50 }
            ]);
            return history;
        }
        catch (error) {
            console.error('Error fetching item price history:', error);
            throw new Error('Failed to fetch item price history');
        }
    }
    /**
     * Get transactions by company
     */
    async getTransactionsByCompany(companyCode, userId) {
        try {
            const company = await Company_1.CompanyModel.findOne({ code: companyCode.toUpperCase(), isActive: true });
            if (!company) {
                throw new Error('Company not found');
            }
            const query = { companyId: company._id };
            if (userId) {
                query.userId = userId;
            }
            const transactions = await BusinessTransaction_1.BusinessTransactionModel.find(query)
                .populate('customerId', 'name address country')
                .populate('supplierId', 'name address country')
                .sort({ createdDate: -1 });
            return {
                company: company.name,
                transactions: transactions.map(t => ({
                    _id: t._id,
                    transactionId: t.transactionId,
                    orderReferenceNumber: t.orderReferenceNumber,
                    status: t.status,
                    customerName: t.customerId?.name,
                    supplierName: t.supplierId?.name,
                    totalAmount: t.totalAmount,
                    currency: t.currency,
                    exchangeRate: t.exchangeRate,
                    totalAmountAED: t.totalAmountAED,
                    shipmentMethod: t.shipmentMethod,
                    createdDate: t.createdDate,
                    updatedDate: t.updatedDate
                }))
            };
        }
        catch (error) {
            console.error('Error fetching company transactions:', error);
            throw new Error('Failed to fetch company transactions');
        }
    }
    /**
     * Export report data (placeholder for future implementation)
     */
    async exportReport(format, filters) {
        // This would implement actual export functionality
        // For now, return a placeholder
        const data = await this.getReportSummary(filters);
        const csvContent = this.generateCSV(data);
        return Buffer.from(csvContent, 'utf8');
    }
    generateCSV(data) {
        const headers = ['Order Reference', 'Company', 'Customer', 'Status', 'Amount', 'Currency', 'Date'];
        const rows = data.recentTransactions.map(t => [
            t.orderReferenceNumber,
            t.companyName,
            t.customerName,
            t.status,
            t.totalAmount,
            t.currency,
            new Date(t.createdDate).toISOString().split('T')[0]
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}
exports.ReportingService = ReportingService;
//# sourceMappingURL=reporting.service.js.map