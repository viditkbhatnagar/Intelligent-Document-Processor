import { Request, Response } from 'express';
import { POGenerationService, POGenerationRequest } from '../services/po-generation.service';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export class POGenerationController {
  private poGenerationService = new POGenerationService();

  /**
   * Generate PO and PFI from quotation
   */
  async generatePOAndPFI(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'demo-user';
      
      const request: POGenerationRequest = {
        transactionId: req.body.transactionId,
        shippingTerms: req.body.shippingTerms,
        portName: req.body.portName,
        buyerOrderReference: req.body.buyerOrderReference,
        shipmentMethod: req.body.shipmentMethod
      };

      // Validate required fields
      if (!request.transactionId || !request.shipmentMethod) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      const result = await this.poGenerationService.generatePOAndPFI(request);

      res.json({
        success: true,
        po: result.po,
        pfi: result.pfi,
        message: 'PO and PFI generated successfully'
      });

    } catch (error) {
      console.error('Error generating PO and PFI:', error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate PO and PFI' 
      });
    }
  }

  /**
   * Get transaction details for PO generation form
   */
  async getTransactionForPOGeneration(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      
      // This would fetch transaction details including quotation data
      // For now, returning a placeholder
      res.json({
        success: true,
        transaction: {
          transactionId,
          orderReferenceNumber: 'ORD-123',
          companyName: 'Rock Stone',
          customerName: 'ABC Trading',
          supplierName: 'XYZ Suppliers',
          quotationItems: [
            {
              itemName: 'Product A',
              quantity: 100,
              unitPrice: 50,
              currency: 'USD'
            }
          ]
        }
      });

    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch transaction details' 
      });
    }
  }
}
