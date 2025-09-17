"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("./database/connection");
const template_seeder_1 = require("./database/template-seeder");
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const template_routes_1 = __importDefault(require("./routes/template.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const template_population_routes_1 = __importDefault(require("./routes/template-population.routes"));
const workflow_routes_1 = __importDefault(require("./routes/workflow.routes"));
const workflow_actions_routes_1 = __importDefault(require("./routes/workflow-actions.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
// Load environment variables from root directory
dotenv_1.default.config({ path: '../.env' });
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
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'intelligent-document-processor-backend'
    });
});
// Error handling middleware
app.use(error_middleware_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Start server
const startServer = async () => {
    try {
        await (0, connection_1.connectDatabase)();
        // Seed templates on startup
        console.log('🌱 Seeding templates...');
        await (0, template_seeder_1.seedTemplates)();
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