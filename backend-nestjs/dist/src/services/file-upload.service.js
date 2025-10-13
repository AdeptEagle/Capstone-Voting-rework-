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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const fs = require("fs");
const path = require("path");
const cloudinary_service_1 = require("./cloudinary.service");
let FileUploadService = class FileUploadService {
    constructor(cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
        this.uploadDir = 'uploads';
        this.maxFileSize = 5 * 1024 * 1024;
        this.allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        this.allowedDocumentTypes = ['.pdf', '.doc', '.docx', '.txt'];
        this.ensureUploadDirectory();
    }
    ensureUploadDirectory() {
        const uploadPath = path.join(process.cwd(), this.uploadDir);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
    }
    validateFileSize(file) {
        return file.size <= this.maxFileSize;
    }
    validateFileType(file, allowedTypes) {
        const fileExtension = (0, path_1.extname)(file.originalname).toLowerCase();
        return allowedTypes.includes(fileExtension);
    }
    generateFileName(originalName) {
        const fileExtension = (0, path_1.extname)(originalName);
        const uniqueId = (0, uuid_1.v4)();
        return `${uniqueId}${fileExtension}`;
    }
    async processUploadedFile(file, type) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (!this.validateFileSize(file)) {
            throw new common_1.BadRequestException(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`);
        }
        if (type === 'image') {
            if (!this.validateFileType(file, this.allowedImageTypes)) {
                throw new common_1.BadRequestException(`Invalid image type. Allowed types: ${this.allowedImageTypes.join(', ')}`);
            }
            const uploadPath = path.join(process.cwd(), this.uploadDir, 'images');
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
                url: `/uploads/images/${fileName}`,
                type: 'image',
                uploadedAt: new Date(),
            };
        }
        else if (type === 'document') {
            if (!this.validateFileType(file, this.allowedDocumentTypes)) {
                throw new common_1.BadRequestException(`Invalid document type. Allowed types: ${this.allowedDocumentTypes.join(', ')}`);
            }
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
        throw new common_1.BadRequestException('Invalid file type');
    }
    getImageUploadConfig() {
        return {
            storage: (0, multer_1.diskStorage)({
                destination: (req, file, cb) => {
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
                    return cb(new common_1.BadRequestException(`Invalid file type. Allowed types: ${this.allowedImageTypes.join(', ')}`), false);
                }
                cb(null, true);
            },
            limits: {
                fileSize: this.maxFileSize,
            },
        };
    }
    getDocumentUploadConfig() {
        return {
            storage: (0, multer_1.diskStorage)({
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
                    return cb(new common_1.BadRequestException(`Invalid file type. Allowed types: ${this.allowedDocumentTypes.join(', ')}`), false);
                }
                cb(null, true);
            },
            limits: {
                fileSize: this.maxFileSize,
            },
        };
    }
    async deleteFile(fileInfo) {
        try {
            if (fileInfo.type === 'image' && fileInfo.publicId) {
                const result = await this.cloudinaryService.deleteImage(fileInfo.publicId);
                return result.success;
            }
            else if (fileInfo.url && fileInfo.url.startsWith('/uploads/')) {
                const filePath = path.join(process.cwd(), fileInfo.url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }
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
    async getFileInfo(filename, type) {
        if (type === 'image') {
            return {
                filename,
                originalName: filename,
                type: 'image',
                url: `/uploads/images/${filename}`,
                uploadedAt: new Date(),
            };
        }
        else {
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
    getMimeType(filename) {
        const ext = (0, path_1.extname)(filename).toLowerCase();
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.txt': 'text/plain',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map