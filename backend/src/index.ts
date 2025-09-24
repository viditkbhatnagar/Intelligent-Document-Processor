// CRITICAL: Load environment variables FIRST, before any imports
import dotenv from 'dotenv';
import path from 'path';
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Now import everything else AFTER environment variables are loaded
import express from 'express';
import cors from 'cors';
import { connectDatabase, disconnectDatabase } from './database/connection';
import { seedTemplates } from './database/template-seeder';
import { CompanyService } from './services/company.service';
import documentRoutes from './routes/document.routes';
import templateRoutes from './routes/template.routes';
import authRoutes from './routes/auth.routes';
import templatePopulationRoutes from './routes/template-population.routes';
import workflowRoutes from './routes/workflow.routes';
import workflowActionsRoutes from './routes/workflow-actions.routes';
import quotationRoutes from './routes/quotation.routes';
import poGenerationRoutes from './routes/po-generation.routes';
import invoiceGenerationRoutes from './routes/invoice-generation.routes';
import collectionDocumentsRoutes from './routes/collection-documents.routes';
import reportingRoutes from './routes/reporting.routes';
import workflowTransactionsRoutes from './routes/workflow-transactions.routes';
import { errorHandler } from './middleware/error.middleware';


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/populate', templatePopulationRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/workflow-actions', workflowActionsRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/po-generation', poGenerationRoutes);
app.use('/api/invoice-generation', invoiceGenerationRoutes);
app.use('/api/collection-documents', collectionDocumentsRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/workflow-transactions', workflowTransactionsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'intelligent-document-processor-backend'
  });
});

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  const frontendBuildPath = path.join(__dirname, '../frontend-build');
  app.use(express.static(frontendBuildPath));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    } else {
      res.status(404).json({ message: 'API route not found' });
    }
  });
} else {
  // Development mode - just handle 404 for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
  });
}

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    // Seed templates on startup
    console.log('🌱 Seeding templates...');
    await seedTemplates();
    
    // Initialize companies on startup
    console.log('🏢 Initializing companies...');
    const companyService = new CompanyService();
    await companyService.initializeDefaultCompanies();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📋 Template Population API: http://localhost:${PORT}/api/populate`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

startServer();