import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private readonly uploadDir = 'uploads';
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  private readonly allowedDocumentTypes = ['.pdf', '.doc', '.docx', '.txt'];

  constructor() {
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    const uploadPath = path.join(process.cwd(), this.uploadDir);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
  }

  // Generate unique filename
  private generateFileName(originalName: string): string {
    const fileExtension = extname(originalName);
    const uniqueId = uuidv4();
    return `${uniqueId}${fileExtension}`;
  }

  // Validate file type
  private validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    const fileExtension = extname(file.originalname).toLowerCase();
    return allowedTypes.includes(fileExtension);
  }

  // Validate file size
  private validateFileSize(file: Express.Multer.File): boolean {
    return file.size <= this.maxFileSize;
  }

  // Multer configuration for images
  getImageUploadConfig() {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), this.uploadDir, 'images');
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

  // Process uploaded file
  async processUploadedFile(file: Express.Multer.File, type: 'image' | 'document') {
    console.log('processUploadedFile called with:', { file, type });
    console.log('File properties:', file ? Object.keys(file) : 'No file');
    
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    console.log('File details:', {
      originalname: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    });

    // Validate file size
    if (!this.validateFileSize(file)) {
      throw new BadRequestException(`File size too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Validate file type
    const allowedTypes = type === 'image' ? this.allowedImageTypes : this.allowedDocumentTypes;
    if (!this.validateFileType(file, allowedTypes)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Generate file info
    const fileInfo = {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${type}s/${file.filename}`,
      type: type,
      uploadedAt: new Date(),
    };

    console.log('Generated fileInfo:', fileInfo);

    // Validate that filename is not undefined
    if (!fileInfo.filename) {
      console.error('Filename is undefined, file object:', file);
      throw new BadRequestException('File upload failed: filename is undefined');
    }

    return fileInfo;
  }

  // Get file URL
  getFileUrl(filename: string, type: 'image' | 'document'): string {
    return `/uploads/${type}s/${filename}`;
  }

  // Delete file
  async deleteFile(filename: string, type: 'image' | 'document'): Promise<boolean> {
    try {
      const filePath = path.join(process.cwd(), this.uploadDir, `${type}s`, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Get file info
  async getFileInfo(filename: string, type: 'image' | 'document') {
    const filePath = path.join(process.cwd(), this.uploadDir, `${type}s`, filename);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);
    return {
      filename,
      originalName: filename, // We'll need to store this in database
      size: stats.size,
      mimetype: this.getMimeType(filename),
      url: this.getFileUrl(filename, type),
      uploadedAt: stats.birthtime,
      type,
    };
  }

  // Get MIME type based on file extension
  private getMimeType(filename: string): string {
    const ext = extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
    };
    return mimeTypes[ext] || 'application/octet-stream';
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
} 