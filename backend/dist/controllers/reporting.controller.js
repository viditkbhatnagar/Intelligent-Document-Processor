"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingController = void 0;
const reporting_service_1 = require("../services/reporting.service");
class ReportingController {
    constructor() {
        this.reportingService = new reporting_service_1.ReportingService();
    }
    /**
     * Get report summary with filtering options
     */
    async getReportSummary(req, res) {
        try {
            const userId = req.user?.userId || 'demo-user';
            const filters = {
                company: req.query.company,
                dateRange: req.query.dateRange,
                currency: req.query.currency,
                userId
            };
            const summary = await this.reportingService.getReportSummary(filters);
            res.json(summary);
        }
        catch (error) {
            console.error('Error getting report summary:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get report summary'
            });
        }
    }
    /**
     * Get item price history
     */
    async getItemPriceHistory(req, res) {
        try {
            const userId = req.user?.userId || 'demo-user';
            const filters = {
                item: req.query.item,
                company: req.query.company,
                supplierId: req.query.supplierId,
                limit: req.query.limit ? parseInt(req.query.limit) : 50,
                userId
            };
            const history = await this.reportingService.getItemPriceHistory(filters);
            res.json({
                success: true,
                history
            });
        }
        catch (error) {
            console.error('Error getting item price history:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get item price history'
            });
        }
    }
    /**
     * Get transactions by company
     */
    async getTransactionsByCompany(req, res) {
        try {
            const { companyCode } = req.params;
            const userId = req.user?.userId || 'demo-user';
            const result = await this.reportingService.getTransactionsByCompany(companyCode, userId);
            res.json({
                success: true,
                ...result
            });
        }
        catch (error) {
            console.error('Error getting company transactions:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get company transactions'
            });
        }
    }
    /**
     * Export report in specified format
     */
    async exportReport(req, res) {
        try {
            const { format } = req.params;
            const userId = req.user?.userId || 'demo-user';
            const filters = {
                company: req.query.company,
                dateRange: req.query.dateRange,
                currency: req.query.currency,
                userId
            };
            const reportBuffer = await this.reportingService.exportReport(format, filters);
            // Set appropriate headers for file download
            const filename = `trading-report-${new Date().toISOString().split('T')[0]}.${format}`;
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            switch (format) {
                case 'csv':
                    res.setHeader('Content-Type', 'text/csv');
                    break;
                case 'excel':
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    break;
                case 'pdf':
                    res.setHeader('Content-Type', 'application/pdf');
                    break;
            }
            res.send(reportBuffer);
        }
        catch (error) {
            console.error('Error exporting report:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to export report'
            });
        }
    }
}
exports.ReportingController = ReportingController;
//# sourceMappingURL=reporting.controller.js.map