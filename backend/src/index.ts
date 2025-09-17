// CRITICAL: Load environment variables FIRST, before any imports
import dotenv from 'dotenv';
const path = require('path');
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Now import everything else AFTER environment variables are loaded
import express from 'express';
import cors from 'cors';
import { connectDatabase, disconnectDatabase } from './database/connection';
import { seedTemplates } from './database/template-seeder';
import documentRoutes from './routes/document.routes';
import templateRoutes from './routes/template.routes';
import authRoutes from './routes/auth.routes';
import templatePopulationRoutes from './routes/template-population.routes';
import workflowRoutes from './routes/workflow.routes';
import workflowActionsRoutes from './routes/workflow-actions.routes';
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'intelligent-document-processor-backend'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    // Seed templates on startup
    console.log('🌱 Seeding templates...');
    await seedTemplates();
    
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