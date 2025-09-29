import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  Logger,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FileUploadService, UploadResult, UploadOptions } from './file-upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { MulterFile } from '../shared/types';

@ApiTags('File Upload')
@Controller('upload')
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);

  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('single')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiQuery({ name: 'folder', required: false, description: 'Upload folder path' })
  @ApiQuery({ name: 'resourceType', required: false, enum: ['image', 'video', 'raw', 'auto'], description: 'Resource type for Cloudinary' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ 
            maxSize: 10 * 1024 * 1024, // 10MB
            message: 'File size must not exceed 10MB'
          }),
          // new FileTypeValidator({ 
          //   // fileType: /\.(jpg|jpeg|png|pdf|doc|docx)$/i,
          // }),
        ],
        exceptionFactory: (error) => {
          return new BadRequestException(`File validation failed: ${error}`);
        },
      }),
    )
    file: MulterFile,
    @Query('folder') folder?: string,
    @Query('resourceType') resourceType?: 'image' | 'video' | 'raw' | 'auto',
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const options: UploadOptions = {};
    if (folder) options.folder = folder;
    if (resourceType) options.resourceType = resourceType;

    this.logger.log(`Uploading single file: ${file.originalname} to folder: ${folder || 'default'}`);
    return this.fileUploadService.uploadFile(file, options);
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiQuery({ name: 'folder', required: false, description: 'Upload folder path' })
  @ApiQuery({ name: 'resourceType', required: false, enum: ['image', 'video', 'raw', 'auto'], description: 'Resource type for Cloudinary' })
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadMultipleFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ 
            maxSize: 10 * 1024 * 1024, // 10MB
            message: 'Each file size must not exceed 10MB'
          }),
          // new FileTypeValidator({ 
          //   // fileType: /\.(jpg|jpeg|png|pdf|doc|docx)$/i,
          //   // fileType: "image/*,application/pdf",
          //   // message: 'Only JPG, PNG, PDF, DOC, and DOCX files are allowed'
          // }),
        ],
        exceptionFactory: (error) => {
          return new BadRequestException(`File validation failed: ${error}`);
        },
      }),
    )
    files: MulterFile[],
    @Query('folder') folder?: string,
    @Query('resourceType') resourceType?: 'image' | 'video' | 'raw' | 'auto',
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Additional validation for total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 50 * 1024 * 1024; // 50MB total
    
    if (totalSize > maxTotalSize) {
      throw new BadRequestException('Total file size exceeds 50MB limit');
    }

    const options: UploadOptions = {};
    if (folder) options.folder = folder;
    if (resourceType) options.resourceType = resourceType;

    this.logger.log(`Uploading ${files.length} files to folder: ${folder || 'default'}`);
    return this.fileUploadService.uploadMultipleFiles(files, options);
  }
}
