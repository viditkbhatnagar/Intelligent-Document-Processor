import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const connectDatabase = async (): Promise<void> => {
  try {
    // Check if we should use local MongoDB or in-memory
    const useInMemory = process.env.NODE_ENV === 'development' || !process.env.MONGODB_URI?.includes('mongodb+srv');
    
    let mongoURI: string;
    
    if (useInMemory) {
      // Use in-memory MongoDB for development
      console.log('🚀 Starting in-memory MongoDB...');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'intelligent-document-processor'
        }
      });
      mongoURI = mongoServer.getUri();
      console.log('💾 In-memory MongoDB started at:', mongoURI);
    } else {
      // Use provided MongoDB URI (for production/Atlas)
      mongoURI = process.env.MONGODB_URI!;
      console.log('🔗 Connecting to external MongoDB...');
    }
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
    
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('🛑 In-memory MongoDB stopped');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
};