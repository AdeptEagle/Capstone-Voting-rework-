import { FileUploadService } from '../services/file-upload.service';
export declare class FileUploadController {
    private readonly fileUploadService;
    constructor(fileUploadService: FileUploadService);
    uploadImage(file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        file: any;
    }>;
    uploadDocument(file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        file: any;
    }>;
    getUploadStats(): Promise<{
        totalFiles: number;
        images: number;
        documents: number;
        maxFileSize: string;
        allowedImageTypes: string[];
        allowedDocumentTypes: string[];
    }>;
    getFileInfo(type: 'image' | 'document', filename: string): Promise<{
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
    deleteFile(type: 'image' | 'document', filename: string): Promise<{
        success: boolean;
        message: string;
    }>;
    testFileUploadService(): Promise<{
        success: boolean;
        message: string;
        service: string;
        timestamp: string;
    }>;
}
