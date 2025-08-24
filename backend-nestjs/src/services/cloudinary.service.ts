import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload image to Cloudinary
   * @param file - The uploaded file
   * @param folder - The folder to upload to (e.g., 'candidates', 'voters')
   * @returns Promise with upload result
   */
  async uploadImage(file: Express.Multer.File, folder: string = 'voting-system') {
    try {
      // Convert buffer to base64 for Cloudinary
      const base64Image = file.buffer.toString('base64');
      const dataURI = `data:${file.mimetype};base64,${base64Image}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Resize large images
          { quality: 'auto:good' }, // Optimize quality
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
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - The public ID of the image
   * @returns Promise with deletion result
   */
  async deleteImage(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return {
        success: result.result === 'ok',
        message: result.result === 'ok' ? 'Image deleted successfully' : 'Failed to delete image',
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Get optimized image URL with transformations
   * @param publicId - The public ID of the image
   * @param transformations - Cloudinary transformations
   * @returns Optimized image URL
   */
  getOptimizedImageUrl(publicId: string, transformations: any = {}) {
    const defaultTransformations = {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto:good',
      ...transformations,
    };

    return cloudinary.url(publicId, defaultTransformations);
  }

  /**
   * Get thumbnail URL for an image
   * @param publicId - The public ID of the image
   * @param size - Thumbnail size (default: 150)
   * @returns Thumbnail URL
   */
  getThumbnailUrl(publicId: string, size: number = 150) {
    return cloudinary.url(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      quality: 'auto:good',
    });
  }
}

