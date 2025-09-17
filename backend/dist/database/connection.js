"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongoServer;
const connectDatabase = async () => {
    try {
        // Check if we should use local MongoDB or in-memory
        const useInMemory = process.env.NODE_ENV === 'development' || !process.env.MONGODB_URI?.includes('mongodb+srv');
        let mongoURI;
        if (useInMemory) {
            // Use in-memory MongoDB for development
            console.log('🚀 Starting in-memory MongoDB...');
            mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create({
                instance: {
                    dbName: 'intelligent-document-processor'
                }
            });
            mongoURI = mongoServer.getUri();
            console.log('💾 In-memory MongoDB started at:', mongoURI);
        }
        else {
            // Use provided MongoDB URI (for production/Atlas)
            mongoURI = process.env.MONGODB_URI;
            console.log('🔗 Connecting to external MongoDB...');
        }
        await mongoose_1.default.connect(mongoURI);
        console.log('✅ MongoDB connected successfully');
        mongoose_1.default.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });
    }
    catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
            console.log('🛑 In-memory MongoDB stopped');
        }
    }
    catch (error) {
        console.error('❌ Error disconnecting from database:', error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
//# sourceMappingURL=connection.js.map