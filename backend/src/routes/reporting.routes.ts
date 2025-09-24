import express from 'express';
import { ReportingController } from '../controllers/reporting.controller';

const router = express.Router();
const reportingController = new ReportingController();

// Get comprehensive report summary
router.get('/summary', reportingController.getReportSummary.bind(reportingController));

// Get item price history
router.get('/item-history', reportingController.getItemPriceHistory.bind(reportingController));

// Get transactions by company
router.get('/company/:companyCode/transactions', reportingController.getTransactionsByCompany.bind(reportingController));

// Export reports
router.get('/export/:format', reportingController.exportReport.bind(reportingController));

export default router;
