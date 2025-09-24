import { Request, Response } from 'express';
import multer from 'multer';
import { CollectionDocumentsService, CollectionDocumentsRequest } from '../services/collection-documents.service';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export class CollectionDocumentsController {
  private collectionService = new CollectionDocumentsService();

  /**
   * Get available banks for dropdown
   */
  async getAvailableBanks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const banks = this.collectionService.getAvailableBanks();
      res.json({
        success: true,
        banks: banks.map(bank => ({
          code: bank,
          name: this.getBankFullName(bank)
        }))
      });
    } catch (error) {
      console.error('Error fetching banks:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch banks list' 
      });
    }
  }

  /**
   * Generate collection documents
   */
  async generateCollectionDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'demo-user';
      
      if (!req.file) {
        res.status(400).json({ 
          success: false,
          message: 'Transport document file is required' 
        });
        return;
      }

      const { 
        transactionId, 
        bankName,
        invoiceNumber,
        invoiceAmount,
        currency
      } = req.body;

      // Validate required fields
      if (!transactionId || !bankName || !invoiceNumber || !invoiceAmount || !currency) {
        res.status(400).json({ 
          success: false,
          message: 'Missing required fields' 
        });
        return;
      }

      const request: CollectionDocumentsRequest = {
        transactionId,
        bankName: bankName as 'ADIB' | 'DIB' | 'BOK',
        invoiceData: {
          invoiceNumber,
          invoiceAmount: parseFloat(invoiceAmount),
          currency
        },
        transportDocumentFile: req.file.buffer,
        transportDocumentType: req.file.mimetype,
        transportDocumentName: req.file.originalname
      };

      const result = await this.collectionService.generateCollectionDocuments(request);

      res.json({
        success: true,
        coveringLetter: result.coveringLetter,
        billOfExchange: result.billOfExchange,
        transportDocument: result.transportDocumentData,
        message: 'Collection documents generated successfully'
      });

    } catch (error) {
      console.error('Error generating collection documents:', error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate collection documents' 
      });
    }
  }

  /**
   * Get bank full name from code
   */
  private getBankFullName(code: string): string {
    const bankNames = {
      'ADIB': 'Abu Dhabi Islamic Bank',
      'DIB': 'Dubai Islamic Bank',
      'BOK': 'Bank of Kuwait'
    };
    return bankNames[code as keyof typeof bankNames] || code;
  }
}
