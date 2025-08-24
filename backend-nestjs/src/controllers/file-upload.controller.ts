import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FileUploadService } from '../services/file-upload.service';

@ApiTags('File Upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload/image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        // Temporary storage before Cloudinary upload
        const uploadPath = path.join(process.cwd(), 'uploads', 'temp');
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const fileExtension = extname(file.originalname);
        const uniqueId = uuidv4();
        const fileName = `${uniqueId}${fileExtension}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const fileExtension = extname(file.originalname).toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        return cb(
          new BadRequestException(
            `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
          ),
          false
        );
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  @ApiOperation({
    summary: 'Upload candidate photo',
    description: 'Upload an image file for candidate photos. Supports JPG, PNG, GIF, WebP up to 5MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPG, PNG, GIF, WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        file: {
          type: 'object',
          properties: {
            originalName: { type: 'string' },
            filename: { type: 'string' },
            mimetype: { type: 'string' },
            size: { type: 'number' },
            url: { type: 'string' },
            type: { type: 'string' },
            uploadedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size',
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      const fileInfo = await this.fileUploadService.processUploadedFile(file, 'image');
      
      return {
        success: true,
        message: 'Image uploaded successfully',
        file: fileInfo,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('upload/document')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads', 'documents');
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const fileExtension = extname(file.originalname);
        const uniqueId = uuidv4();
        const fileName = `${uniqueId}${fileExtension}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = extname(file.originalname).toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        return cb(
          new BadRequestException(
            `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
          ),
          false
        );
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  @ApiOperation({
    summary: 'Upload document',
    description: 'Upload a document file. Supports PDF, DOC, DOCX, TXT up to 5MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file (PDF, DOC, DOCX, TXT)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        file: {
          type: 'object',
          properties: {
            originalName: { type: 'string' },
            filename: { type: 'string' },
            mimetype: { type: 'string' },
            size: { type: 'number' },
            url: { type: 'string' },
            type: { type: 'string' },
            uploadedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size',
  })
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    try {
      const fileInfo = await this.fileUploadService.processUploadedFile(file, 'document');
      
      return {
        success: true,
        message: 'Document uploaded successfully',
        file: fileInfo,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get upload statistics',
    description: 'Get statistics about uploaded files including counts and allowed types.',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalFiles: { type: 'number' },
        images: { type: 'number' },
        documents: { type: 'number' },
        maxFileSize: { type: 'string' },
        allowedImageTypes: { type: 'array', items: { type: 'string' } },
        allowedDocumentTypes: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getUploadStats() {
    return await this.fileUploadService.getUploadStats();
  }

  @Get('file/:type/:filename')
  @ApiOperation({
    summary: 'Get file information',
    description: 'Get information about a specific uploaded file.',
  })
  @ApiParam({ name: 'type', description: 'File type (image or document)' })
  @ApiParam({ name: 'filename', description: 'File filename' })
  @ApiResponse({
    status: 200,
    description: 'File information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string' },
        originalName: { type: 'string' },
        size: { type: 'number' },
        mimetype: { type: 'string' },
        url: { type: 'string' },
        uploadedAt: { type: 'string', format: 'date-time' },
        type: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async getFileInfo(
    @Param('type') type: 'image' | 'document',
    @Param('filename') filename: string,
  ) {
    const fileInfo = await this.fileUploadService.getFileInfo(filename, type);
    
    if (!fileInfo) {
      throw new BadRequestException('File not found');
    }
    
    return fileInfo;
  }

  @Delete('file/:type/:filename')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete uploaded file',
    description: 'Delete a specific uploaded file from the server.',
  })
  @ApiParam({ name: 'type', description: 'File type (image or document)' })
  @ApiParam({ name: 'filename', description: 'File filename' })
  @ApiResponse({
    status: 204,
    description: 'File deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async deleteFile(
    @Param('type') type: 'image' | 'document',
    @Param('filename') filename: string,
  ) {
    // Create file info object for deletion
    const fileInfo = {
      url: `/${type}s/${filename}`,
      filename: filename,
      type: type
    };
    
    const deleted = await this.fileUploadService.deleteFile(fileInfo);
    
    if (!deleted) {
      throw new BadRequestException('File not found or could not be deleted');
    }
    
    return { success: true, message: 'File deleted successfully' };
  }

  @Get('test')
  @ApiOperation({
    summary: 'Test file upload service',
    description: 'Test endpoint to verify file upload service is working.',
  })
  @ApiResponse({
    status: 200,
    description: 'File upload service is working',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        service: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async testFileUploadService() {
    return {
      success: true,
      message: 'File upload service is working correctly',
      service: 'FileUploadService',
      timestamp: new Date().toISOString(),
    };
  }
} 