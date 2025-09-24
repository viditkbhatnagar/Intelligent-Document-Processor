import { ObjectId } from 'mongodb';
export declare class GridFSService {
    private bucket;
    constructor();
    private getBucket;
    /**
     * Store file in MongoDB GridFS
     */
    storeFile(buffer: Buffer, filename: string, metadata: {
        originalName: string;
        mimeType: string;
        userId: string;
        uploadDate: Date;
    }): Promise<ObjectId>;
    /**
     * Retrieve file from MongoDB GridFS
     */
    getFile(fileId: string | ObjectId): Promise<Buffer>;
    /**
     * Get file info from GridFS
     */
    getFileInfo(fileId: string | ObjectId): Promise<any>;
    /**
     * Delete file from GridFS
     */
    deleteFile(fileId: string | ObjectId): Promise<boolean>;
    /**
     * Create readable stream from GridFS file
     */
    createReadStream(fileId: string | ObjectId): NodeJS.ReadableStream;
    /**
     * List files with pagination
     */
    listFiles(userId?: string, limit?: number, skip?: number): Promise<any[]>;
}
