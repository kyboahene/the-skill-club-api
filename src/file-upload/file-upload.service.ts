import { MulterFile } from '@/shared/types';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';



export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
  originalName: string;
  uploadedAt: Date;
  folder?: string;
}

export interface UploadOptions {
  folder?: string;
  transformation?: any[];
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

@Injectable()
export class FileUploadService implements OnModuleInit {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly allowedFormats = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  // Predefined folder constants
  public static readonly FOLDERS = {
    PROFILE_IMAGES: 'theSkillClub/profiles/images',
    COMPANY_LOGOS: 'theSkillClub/companies/logos',
    DOCUMENTS: 'theSkillClub/documents',
    ASSESSMENTS: 'theSkillClub/assessments',
    CERTIFICATES: 'theSkillClub/certificates',
    RESUMES: 'theSkillClub/resumes',
    PORTFOLIO: 'theSkillClub/portfolio',
    MISC: 'theSkillClub/misc',
  } as const;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.initializeCloudinary();
  }

  private initializeCloudinary(): void {
    const config: CloudinaryConfig = {
      cloudName: this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || '',
      apiKey: this.configService.get<string>('CLOUDINARY_API_KEY') || '',
      apiSecret: this.configService.get<string>('CLOUDINARY_API_SECRET') || '',
    };

    // Validate configuration
    if (!config.cloudName || !config.apiKey || !config.apiSecret) {
      const missingVars: string[] = [];
      if (!config.cloudName) missingVars.push('CLOUDINARY_CLOUD_NAME');
      if (!config.apiKey) missingVars.push('CLOUDINARY_API_KEY');
      if (!config.apiSecret) missingVars.push('CLOUDINARY_API_SECRET');
      
      throw new Error(`Missing required Cloudinary configuration: ${missingVars.join(', ')}`);
    }

    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });

    this.logger.log('Cloudinary configuration initialized successfully');
  }

  async uploadFile(file: MulterFile, options?: UploadOptions): Promise<UploadResult> {
    try {
      this.validateFile(file);
      
      this.logger.log(`Starting upload for file: ${file.originalname}`);
      
      const result = await this.uploadToCloudinary(file, options);
      
      this.logger.log(`Successfully uploaded file: ${file.originalname} to ${result.secure_url}`);
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        originalName: file.originalname,
        uploadedAt: new Date(),
        folder: options?.folder,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadMultipleFiles(files: MulterFile[], options?: UploadOptions): Promise<UploadResult[]> {
    try {
      this.logger.log(`Starting batch upload for ${files.length} files`);
      
      files.forEach(file => this.validateFile(file));
      
      const uploadPromises = files.map((file, index) => 
        this.uploadFile(file, options).catch(error => {
          this.logger.error(`Failed to upload file ${index + 1}: ${file.originalname}`, error.stack);
          throw error;
        })
      );
      
      const results = await Promise.all(uploadPromises);
      
      this.logger.log(`Successfully uploaded ${results.length} files`);
      return results;
    } catch (error) {
      throw new Error(`Failed to upload multiple files: ${error.message}`);
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      if (!publicId) {
        throw new Error('Public ID is required for deletion');
      }

      this.logger.log(`Deleting file with public ID: ${publicId}`);
      
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result !== 'ok') {
        throw new Error(`Failed to delete file: ${result.result}`);
      }
      
      this.logger.log(`Successfully deleted file: ${publicId}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${publicId}`, error.stack);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getFileInfo(publicId: string): Promise<any> {
    try {
      if (!publicId) {
        throw new Error('Public ID is required');
      }

      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get file info: ${publicId}`, error.stack);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  async deleteMultipleFiles(publicIds: string[]): Promise<void> {
    try {
      if (!publicIds || publicIds.length === 0) {
        throw new Error('Public IDs are required for deletion');
      }

      this.logger.log(`Deleting ${publicIds.length} files`);
      
      const result = await cloudinary.api.delete_resources(publicIds);
      
      this.logger.log(`Successfully deleted ${Object.keys(result.deleted).length} files`);
      
      // Log any failed deletions
      if (result.partial && Object.keys(result.partial).length > 0) {
        this.logger.warn(`Some files failed to delete:`, result.partial);
      }
    } catch (error) {
      this.logger.error(`Failed to delete multiple files`, error.stack);
      throw new Error(`Failed to delete multiple files: ${error.message}`);
    }
  }

  private validateFile(file: MulterFile): void {
    if (!file) {
      throw new Error('File is required');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size ${file.size} exceeds maximum allowed size of ${this.maxFileSize} bytes`);
    }

    // Additional MIME type validation
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }

    // Validate file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.allowedFormats.includes(fileExtension)) {
      throw new Error(`File extension .${fileExtension} is not allowed`);
    }
  }

  private async uploadToCloudinary(file: MulterFile, options?: UploadOptions): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);

      // Detect file type and set appropriate resource_type
      let resourceType: 'image' | 'video' | 'raw' | 'auto' = options?.resourceType || 'auto';
      
      // Override resource type for specific file types
      if (file.mimetype === 'application/pdf' || 
          file.mimetype === 'application/msword' || 
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        resourceType = 'raw';
      }

      // Default folder structure based on file type
      const defaultFolder = this.getDefaultFolder(file.mimetype);
      const folder = options?.folder || defaultFolder;

      // Default transformations
      const defaultTransformations = file.mimetype.startsWith('image/') 
        ? [{ quality: 'auto:good' }] 
        : [];

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: folder,
          allowed_formats: this.allowedFormats,
          max_bytes: this.maxFileSize,
          transformation: options?.transformation || defaultTransformations,
          use_filename: true,
          unique_filename: true,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error('Cloudinary upload error', error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Unknown upload error'));
          }
        }
      );

      // Handle stream errors
      stream.on('error', (error) => {
        this.logger.error('Stream error during upload', error);
        reject(new Error(`Stream error: ${error.message}`));
      });

      uploadStream.on('error', (error) => {
        this.logger.error('Upload stream error', error);
        reject(new Error(`Upload stream error: ${error.message}`));
      });

      stream.pipe(uploadStream);
    });
  }

  private getDefaultFolder(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return FileUploadService.FOLDERS.MISC; // Default to misc for images, can be overridden
    } else if (mimeType === 'application/pdf') {
      return FileUploadService.FOLDERS.DOCUMENTS;
    } else if (mimeType === 'application/msword' || 
               mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return FileUploadService.FOLDERS.DOCUMENTS;
    } else {
      return FileUploadService.FOLDERS.MISC;
    }
  }

  // Helper method to get file size in human readable format
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Helper method to validate file type
  isValidFileType(file: MulterFile): boolean {
    try {
      this.validateFile(file);
      return true;
    } catch {
      return false;
    }
  }
}
