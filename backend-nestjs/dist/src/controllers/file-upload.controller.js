"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const fs = require("fs");
const path = require("path");
const swagger_1 = require("@nestjs/swagger");
const file_upload_service_1 = require("../services/file-upload.service");
let FileUploadController = class FileUploadController {
    constructor(fileUploadService) {
        this.fileUploadService = fileUploadService;
    }
    async uploadImage(file) {
        try {
            const fileInfo = await this.fileUploadService.processUploadedFile(file, 'image');
            return {
                success: true,
                message: 'Image uploaded successfully',
                file: fileInfo,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async uploadDocument(file) {
        try {
            const fileInfo = await this.fileUploadService.processUploadedFile(file, 'document');
            return {
                success: true,
                message: 'Document uploaded successfully',
                file: fileInfo,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getUploadStats() {
        return await this.fileUploadService.getUploadStats();
    }
    async getFileInfo(type, filename) {
        const fileInfo = await this.fileUploadService.getFileInfo(filename, type);
        if (!fileInfo) {
            throw new common_1.BadRequestException('File not found');
        }
        return fileInfo;
    }
    async deleteFile(type, filename) {
        const fileInfo = {
            url: `/${type}s/${filename}`,
            filename: filename,
            type: type
        };
        const deleted = await this.fileUploadService.deleteFile(fileInfo);
        if (!deleted) {
            throw new common_1.BadRequestException('File not found or could not be deleted');
        }
        return { success: true, message: 'File deleted successfully' };
    }
    async testFileUploadService() {
        return {
            success: true,
            message: 'File upload service is working correctly',
            service: 'FileUploadService',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.FileUploadController = FileUploadController;
__decorate([
    (0, common_1.Post)('upload/image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = path.join(process.cwd(), 'uploads', 'temp');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const fileExtension = (0, path_1.extname)(file.originalname);
                const uniqueId = (0, uuid_1.v4)();
                const fileName = `${uniqueId}${fileExtension}`;
                cb(null, fileName);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const fileExtension = (0, path_1.extname)(file.originalname).toLowerCase();
            if (!allowedTypes.includes(fileExtension)) {
                return cb(new common_1.BadRequestException(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload candidate photo',
        description: 'Upload an image file for candidate photos. Supports JPG, PNG, GIF, WebP up to 5MB.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid file type or size',
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('upload/document'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = path.join(process.cwd(), 'uploads', 'documents');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const fileExtension = (0, path_1.extname)(file.originalname);
                const uniqueId = (0, uuid_1.v4)();
                const fileName = `${uniqueId}${fileExtension}`;
                cb(null, fileName);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
            const fileExtension = (0, path_1.extname)(file.originalname).toLowerCase();
            if (!allowedTypes.includes(fileExtension)) {
                return cb(new common_1.BadRequestException(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload document',
        description: 'Upload a document file. Supports PDF, DOC, DOCX, TXT up to 5MB.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid file type or size',
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get upload statistics',
        description: 'Get statistics about uploaded files including counts and allowed types.',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getUploadStats", null);
__decorate([
    (0, common_1.Get)('file/:type/:filename'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get file information',
        description: 'Get information about a specific uploaded file.',
    }),
    (0, swagger_1.ApiParam)({ name: 'type', description: 'File type (image or document)' }),
    (0, swagger_1.ApiParam)({ name: 'filename', description: 'File filename' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'File not found',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFileInfo", null);
__decorate([
    (0, common_1.Delete)('file/:type/:filename'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete uploaded file',
        description: 'Delete a specific uploaded file from the server.',
    }),
    (0, swagger_1.ApiParam)({ name: 'type', description: 'File type (image or document)' }),
    (0, swagger_1.ApiParam)({ name: 'filename', description: 'File filename' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'File deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'File not found',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Get)('test'),
    (0, swagger_1.ApiOperation)({
        summary: 'Test file upload service',
        description: 'Test endpoint to verify file upload service is working.',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "testFileUploadService", null);
exports.FileUploadController = FileUploadController = __decorate([
    (0, swagger_1.ApiTags)('File Upload'),
    (0, common_1.Controller)('file-upload'),
    __metadata("design:paramtypes", [file_upload_service_1.FileUploadService])
], FileUploadController);
//# sourceMappingURL=file-upload.controller.js.map