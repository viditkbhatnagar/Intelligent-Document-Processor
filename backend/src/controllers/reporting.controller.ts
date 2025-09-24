import { Request, Response } from 'express';
import { ReportingService } from '../services/reporting.service';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export class ReportingController {
  private reportingService = new ReportingService();

  /**
   * Get report summary with filtering options
   */
  async getReportSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'demo-user';
      
      const filters = {
        company: req.query.company as string,
        dateRange: req.query.dateRange as string,
        currency: req.query.currency as string,
        userId
      };

      const summary = await this.reportingService.getReportSummary(filters);

      res.json(summary);

    } catch (error) {
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
  async getItemPriceHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'demo-user';
      
      const filters = {
        item: req.query.item as string,
        company: req.query.company as string,
        supplierId: req.query.supplierId as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        userId
      };

      const history = await this.reportingService.getItemPriceHistory(filters);

      res.json({
        success: true,
        history
      });

    } catch (error) {
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
  async getTransactionsByCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyCode } = req.params;
      const userId = req.user?.userId || 'demo-user';
      
      const result = await this.reportingService.getTransactionsByCompany(companyCode, userId);

      res.json({
        success: true,
        ...result
      });

    } catch (error) {
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
  async exportReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { format } = req.params as { format: 'excel' | 'pdf' | 'csv' };
      const userId = req.user?.userId || 'demo-user';
      
      const filters = {
        company: req.query.company as string,
        dateRange: req.query.dateRange as string,
        currency: req.query.currency as string,
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

    } catch (error) {
      console.error('Error exporting report:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to export report'
      });
    }
  }
}
