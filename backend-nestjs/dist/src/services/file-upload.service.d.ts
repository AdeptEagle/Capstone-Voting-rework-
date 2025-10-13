import { CloudinaryService } from './cloudinary.service';
export declare class FileUploadService {
    private readonly cloudinaryService;
    private readonly uploadDir;
    private readonly maxFileSize;
    private readonly allowedImageTypes;
    private readonly allowedDocumentTypes;
    constructor(cloudinaryService: CloudinaryService);
    private ensureUploadDirectory;
    private validateFileSize;
    private validateFileType;
    private generateFileName;
    processUploadedFile(file: Express.Multer.File, type: 'image' | 'document'): Promise<any>;
    getImageUploadConfig(): {
        storage: import("multer").StorageEngine;
        fileFilter: (req: any, file: any, cb: any) => any;
        limits: {
            fileSize: number;
        };
    };
    getDocumentUploadConfig(): {
        storage: import("multer").StorageEngine;
        fileFilter: (req: any, file: any, cb: any) => any;
        limits: {
            fileSize: number;
        };
    };
    deleteFile(fileInfo: any): Promise<boolean>;
    getUploadStats(): Promise<{
        totalFiles: number;
        images: number;
        documents: number;
        maxFileSize: string;
        allowedImageTypes: string[];
        allowedDocumentTypes: string[];
    }>;
    getFileInfo(filename: string, type: 'image' | 'document'): Promise<{
        filename: string;
        originalName: string;
        type: string;
        url: string;
        uploadedAt: Date;
        size?: undefined;
        mimetype?: undefined;
    } | {
        filename: string;
        originalName: string;
        size: number;
        mimetype: string;
        url: string;
        uploadedAt: Date;
        type: string;
    }>;
    private getMimeType;
}
