import { ApiProperty } from "@nestjs/swagger";

export class UploadResponseDto {
    @ApiProperty({ description: 'Secure URL of the uploaded file' })
    url: string;
  
    @ApiProperty({ description: 'Public ID for file management' })
    publicId: string;
  
    @ApiProperty({ description: 'File format' })
    format: string;
  
    @ApiProperty({ description: 'File size in bytes' })
    size: number;
  
    @ApiProperty({ description: 'Original filename' })
    originalName: string;
  
    @ApiProperty({ description: 'Upload timestamp' })
    uploadedAt: Date;
  }