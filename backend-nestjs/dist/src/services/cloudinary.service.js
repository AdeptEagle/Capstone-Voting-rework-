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
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const config_1 = require("@nestjs/config");
let CloudinaryService = class CloudinaryService {
    constructor(configService) {
        this.configService = configService;
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    async uploadImage(file, folder = 'voting-system') {
        try {
            const base64Image = file.buffer.toString('base64');
            const dataURI = `data:${file.mimetype};base64,${base64Image}`;
            const result = await cloudinary_1.v2.uploader.upload(dataURI, {
                folder: folder,
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto:good' },
                ],
                public_id: `${folder}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            });
            return {
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                size: result.bytes,
                uploadedAt: new Date(),
            };
        }
        catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }
    async deleteImage(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            return {
                success: result.result === 'ok',
                message: result.result === 'ok' ? 'Image deleted successfully' : 'Failed to delete image',
            };
        }
        catch (error) {
            console.error('Cloudinary delete error:', error);
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    }
    getOptimizedImageUrl(publicId, transformations = {}) {
        const defaultTransformations = {
            width: 400,
            height: 400,
            crop: 'fill',
            quality: 'auto:good',
            ...transformations,
        };
        return cloudinary_1.v2.url(publicId, defaultTransformations);
    }
    getThumbnailUrl(publicId, size = 150) {
        return cloudinary_1.v2.url(publicId, {
            width: size,
            height: size,
            crop: 'fill',
            quality: 'auto:good',
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map