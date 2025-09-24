"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridFSService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("mongodb");
const stream_1 = require("stream");
class GridFSService {
    constructor() {
        this.bucket = null;
        // GridFS bucket will be initialized when first used
    }
    getBucket() {
        if (!this.bucket) {
            if (!mongoose_1.default.connection.db) {
                throw new Error('MongoDB connection not established. Cannot initialize GridFS.');
            }
            this.bucket = new mongodb_1.GridFSBucket(mongoose_1.default.connection.db, {
                bucketName: 'documents'
            });
        }
        return this.bucket;
    }
    /**
     * Store file in MongoDB GridFS
     */
    async storeFile(buffer, filename, metadata) {
        return new Promise((resolve, reject) => {
            const bucket = this.getBucket();
            const uploadStream = bucket.openUploadStream(filename, {
                metadata: {
                    ...metadata,
                    size: buffer.length
                }
            });
            uploadStream.on('error', reject);
            uploadStream.on('finish', () => {
                resolve(uploadStream.id);
            });
            // Create readable stream from buffer and pipe to GridFS
            const readableStream = new stream_1.Readable();
            readableStream.push(buffer);
            readableStream.push(null); // End the stream
            readableStream.pipe(uploadStream);
        });
    }
    /**
     * Retrieve file from MongoDB GridFS
     */
    async getFile(fileId) {
        return new Promise((resolve, reject) => {
            const bucket = this.getBucket();
            const chunks = [];
            const downloadStream = bucket.openDownloadStream(new mongodb_1.ObjectId(fileId));
            downloadStream.on('data', (chunk) => {
                chunks.push(chunk);
            });
            downloadStream.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            downloadStream.on('error', reject);
        });
    }
    /**
     * Get file info from GridFS
     */
    async getFileInfo(fileId) {
        try {
            const bucket = this.getBucket();
            const files = await bucket.find({ _id: new mongodb_1.ObjectId(fileId) }).toArray();
            return files[0] || null;
        }
        catch (error) {
            console.error('Error getting file info:', error);
            return null;
        }
    }
    /**
     * Delete file from GridFS
     */
    async deleteFile(fileId) {
        try {
            const bucket = this.getBucket();
            await bucket.delete(new mongodb_1.ObjectId(fileId));
            return true;
        }
        catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }
    /**
     * Create readable stream from GridFS file
     */
    createReadStream(fileId) {
        const bucket = this.getBucket();
        return bucket.openDownloadStream(new mongodb_1.ObjectId(fileId));
    }
    /**
     * List files with pagination
     */
    async listFiles(userId, limit = 50, skip = 0) {
        try {
            const bucket = this.getBucket();
            const filter = userId ? { 'metadata.userId': userId } : {};
            const files = await bucket
                .find(filter)
                .sort({ uploadDate: -1 })
                .limit(limit)
                .skip(skip)
                .toArray();
            return files;
        }
        catch (error) {
            console.error('Error listing files:', error);
            return [];
        }
    }
}
exports.GridFSService = GridFSService;
//# sourceMappingURL=gridfs.service.js.map