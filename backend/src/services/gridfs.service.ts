import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

export class GridFSService {
  private bucket: GridFSBucket | null = null;

  constructor() {
    // GridFS bucket will be initialized when first used
  }

  private getBucket(): GridFSBucket {
    if (!this.bucket) {
      if (!mongoose.connection.db) {
        throw new Error('MongoDB connection not established. Cannot initialize GridFS.');
      }
      this.bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'documents'
      });
    }
    return this.bucket;
  }

  /**
   * Store file in MongoDB GridFS
   */
  async storeFile(
    buffer: Buffer,
    filename: string,
    metadata: {
      originalName: string;
      mimeType: string;
      userId: string;
      uploadDate: Date;
    }
  ): Promise<ObjectId> {
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
        resolve(uploadStream.id as ObjectId);
      });

      // Create readable stream from buffer and pipe to GridFS
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null); // End the stream
      readableStream.pipe(uploadStream);
    });
  }

  /**
   * Retrieve file from MongoDB GridFS
   */
  async getFile(fileId: string | ObjectId): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const bucket = this.getBucket();
      const chunks: Buffer[] = [];
      const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

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
  async getFileInfo(fileId: string | ObjectId): Promise<any> {
    try {
      const bucket = this.getBucket();
      const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
      return files[0] || null;
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Delete file from GridFS
   */
  async deleteFile(fileId: string | ObjectId): Promise<boolean> {
    try {
      const bucket = this.getBucket();
      await bucket.delete(new ObjectId(fileId));
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Create readable stream from GridFS file
   */
  createReadStream(fileId: string | ObjectId): NodeJS.ReadableStream {
    const bucket = this.getBucket();
    return bucket.openDownloadStream(new ObjectId(fileId));
  }

  /**
   * List files with pagination
   */
  async listFiles(userId?: string, limit: number = 50, skip: number = 0): Promise<any[]> {
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
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
}
