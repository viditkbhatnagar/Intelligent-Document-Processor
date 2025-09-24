"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reporting_controller_1 = require("../controllers/reporting.controller");
const router = express_1.default.Router();
const reportingController = new reporting_controller_1.ReportingController();
// Get comprehensive report summary
router.get('/summary', reportingController.getReportSummary.bind(reportingController));
// Get item price history
router.get('/item-history', reportingController.getItemPriceHistory.bind(reportingController));
// Get transactions by company
router.get('/company/:companyCode/transactions', reportingController.getTransactionsByCompany.bind(reportingController));
// Export reports
router.get('/export/:format', reportingController.exportReport.bind(reportingController));
exports.default = router;
//# sourceMappingURL=reporting.routes.js.map