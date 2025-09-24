"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// CRITICAL: Load environment variables FIRST, before any imports
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(__dirname, '../../.env');
dotenv_1.default.config({ path: envPath });
// Now import everything else AFTER environment variables are loaded
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./database/connection");
const template_seeder_1 = require("./database/template-seeder");
const company_service_1 = require("./services/company.service");
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const template_routes_1 = __importDefault(require("./routes/template.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const template_population_routes_1 = __importDefault(require("./routes/template-population.routes"));
const workflow_routes_1 = __importDefault(require("./routes/workflow.routes"));
const workflow_actions_routes_1 = __importDefault(require("./routes/workflow-actions.routes"));
const quotation_routes_1 = __importDefault(require("./routes/quotation.routes"));
const po_generation_routes_1 = __importDefault(require("./routes/po-generation.routes"));
const invoice_generation_routes_1 = __importDefault(require("./routes/invoice-generation.routes"));
const collection_documents_routes_1 = __importDefault(require("./routes/collection-documents.routes"));
const reporting_routes_1 = __importDefault(require("./routes/reporting.routes"));
const workflow_transactions_routes_1 = __importDefault(require("./routes/workflow-transactions.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/documents', document_routes_1.default);
app.use('/api/templates', template_routes_1.default);
app.use('/api/populate', template_population_routes_1.default);
app.use('/api/workflow', workflow_routes_1.default);
app.use('/api/workflow-actions', workflow_actions_routes_1.default);
app.use('/api/quotation', quotation_routes_1.default);
app.use('/api/po-generation', po_generation_routes_1.default);
app.use('/api/invoice-generation', invoice_generation_routes_1.default);
app.use('/api/collection-documents', collection_documents_routes_1.default);
app.use('/api/reporting', reporting_routes_1.default);
app.use('/api/workflow-transactions', workflow_transactions_routes_1.default);
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
    const frontendBuildPath = path_1.default.join(__dirname, '../frontend-build');
    app.use(express_1.default.static(frontendBuildPath));
    // Serve React app for all non-API routes
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path_1.default.join(frontendBuildPath, 'index.html'));
        }
        else {
            res.status(404).json({ message: 'API route not found' });
        }
    });
}
else {
    // Development mode - just handle 404 for API routes
    app.use('/api/*', (req, res) => {
        res.status(404).json({ message: 'API route not found' });
    });
}
// Error handling middleware
app.use(error_middleware_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        await (0, connection_1.connectDatabase)();
        // Seed templates on startup
        console.log('🌱 Seeding templates...');
        await (0, template_seeder_1.seedTemplates)();
        // Initialize companies on startup
        console.log('🏢 Initializing companies...');
        const companyService = new company_service_1.CompanyService();
        await companyService.initializeDefaultCompanies();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📖 API Documentation: http://localhost:${PORT}/api/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📋 Template Population API: http://localhost:${PORT}/api/populate`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await (0, connection_1.disconnectDatabase)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await (0, connection_1.disconnectDatabase)();
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map