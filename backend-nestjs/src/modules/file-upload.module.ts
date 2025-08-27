import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadController } from '../controllers/file-upload.controller';
import { FileUploadService } from '../services/file-upload.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  imports: [ConfigModule],
  controllers: [FileUploadController],
  providers: [FileUploadService, CloudinaryService],
  exports: [FileUploadService, CloudinaryService],
})
export class FileUploadModule {} 