import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class FileUploadService {
  private readonly uploadDir = 'uploads';
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  private readonly allowedDocumentTypes = ['.pdf', '.doc', '.docx', '.txt'];

  constructor(private readonly cloudinaryService: CloudinaryService) {
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    const uploadPath = path.join(process.cwd(), this.uploadDir);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
  }

  private validateFileSize(file: Express.Multer.File): boolean {
    return file.size <= this.maxFileSize;
  }

  private validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    const fileExtension = extname(file.originalname).toLowerCase();
    return allowedTypes.includes(fileExtension);
  }

  private generateFileName(originalName: string): string {
    const fileExtension = extname(originalName);
    const uniqueId = uuidv4();
    return `${uniqueId}${fileExtension}`;
  }

  // Process uploaded file using Cloudinary
  async processUploadedFile(file: Express.Multer.File, type: 'image' | 'document'): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.validateFileSize(file)) {
      throw new BadRequestException(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`);
    }

    if (type === 'image') {
      if (!this.validateFileType(file, this.allowedImageTypes)) {
        throw new BadRequestException(
          `Invalid image type. Allowed types: ${this.allowedImageTypes.join(', ')}`
        );
      }
      
      // Upload to Cloudinary
      const folder = 'candidates'; // You can make this dynamic based on context
      const result = await this.cloudinaryService.uploadImage(file, folder);
      
      return {
        originalName: file.originalname,
        filename: result.publicId,
        mimetype: file.mimetype,
        size: result.size,
        url: result.url,
        publicId: result.publicId,
        type: 'image',
        uploadedAt: result.uploadedAt,
      };
    } else if (type === 'document') {
      if (!this.validateFileType(file, this.allowedDocumentTypes)) {
        throw new BadRequestException(
          `Invalid document type. Allowed types: ${this.allowedDocumentTypes.join(', ')}`
        );
      }
      
      // For documents, you might want to keep local storage or use a different cloud service
      // For now, we'll use local storage for documents
      const uploadPath = path.join(process.cwd(), this.uploadDir, 'documents');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      const fileName = this.generateFileName(file.originalname);
      const filePath = path.join(uploadPath, fileName);
      
      fs.writeFileSync(filePath, file.buffer);
      
      return {
        originalName: file.originalname,
        filename: fileName,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/documents/${fileName}`,
        type: 'document',
        uploadedAt: new Date(),
      };
    }

    throw new BadRequestException('Invalid file type');
  }

  // Multer configuration for images (now uses Cloudinary)
  getImageUploadConfig() {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // This is just for temporary storage before Cloudinary upload
          const uploadPath = path.join(process.cwd(), this.uploadDir, 'temp');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const fileName = this.generateFileName(file.originalname);
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!this.validateFileType(file, this.allowedImageTypes)) {
          return cb(
            new BadRequestException(
              `Invalid file type. Allowed types: ${this.allowedImageTypes.join(', ')}`
            ),
            false
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: this.maxFileSize,
      },
    };
  }

  // Multer configuration for documents
  getDocumentUploadConfig() {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), this.uploadDir, 'documents');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const fileName = this.generateFileName(file.originalname);
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!this.validateFileType(file, this.allowedDocumentTypes)) {
          return cb(
            new BadRequestException(
              `Invalid file type. Allowed types: ${this.allowedDocumentTypes.join(', ')}`
            ),
            false
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: this.maxFileSize,
      },
    };
  }

  // Delete file (handles both Cloudinary and local files)
  async deleteFile(fileInfo: any): Promise<boolean> {
    try {
      if (fileInfo.type === 'image' && fileInfo.publicId) {
        // Delete from Cloudinary
        const result = await this.cloudinaryService.deleteImage(fileInfo.publicId);
        return result.success;
      } else if (fileInfo.url && fileInfo.url.startsWith('/uploads/')) {
        // Delete local file
        const filePath = path.join(process.cwd(), fileInfo.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Get upload statistics
  async getUploadStats() {
    const imagePath = path.join(process.cwd(), this.uploadDir, 'images');
    const documentPath = path.join(process.cwd(), this.uploadDir, 'documents');

    const imageCount = fs.existsSync(imagePath) ? fs.readdirSync(imagePath).length : 0;
    const documentCount = fs.existsSync(documentPath) ? fs.readdirSync(documentPath).length : 0;

    return {
      totalFiles: imageCount + documentCount,
      images: imageCount,
      documents: documentCount,
      maxFileSize: `${this.maxFileSize / 1024 / 1024}MB`,
      allowedImageTypes: this.allowedImageTypes,
      allowedDocumentTypes: this.allowedDocumentTypes,
    };
  }

  // Get file information
  async getFileInfo(filename: string, type: 'image' | 'document') {
    if (type === 'image') {
      // For images, we need to check if it's a Cloudinary URL or local file
      // Since we're now using Cloudinary, this method might not be as useful
      // but we'll keep it for backward compatibility
      return {
        filename,
        originalName: filename,
        type: 'image',
        url: `/uploads/images/${filename}`,
        uploadedAt: new Date(),
      };
    } else {
      // For documents, check local storage
      const filePath = path.join(process.cwd(), this.uploadDir, 'documents', filename);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const stats = fs.statSync(filePath);
      return {
        filename,
        originalName: filename,
        size: stats.size,
        mimetype: this.getMimeType(filename),
        url: `/uploads/documents/${filename}`,
        uploadedAt: stats.birthtime,
        type: 'document',
      };
    }
  }

  // Get MIME type based on file extension
  private getMimeType(filename: string): string {
    const ext = extname(filename).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
} 