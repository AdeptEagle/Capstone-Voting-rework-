import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File, folder?: string): Promise<{
        success: boolean;
        url: string;
        publicId: string;
        width: number;
        height: number;
        format: string;
        size: number;
        uploadedAt: Date;
    }>;
    deleteImage(publicId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getOptimizedImageUrl(publicId: string, transformations?: any): string;
    getThumbnailUrl(publicId: string, size?: number): string;
}
