# File Upload API Documentation

## Overview

The File Upload API provides endpoints for uploading files to Cloudinary with organized folder structure and proper validation.

## Base URL

```
http://localhost:9000/upload
```

## Authentication

Currently, the file upload endpoints are public. In production, you should add authentication middleware.

## Endpoints

### Upload Single File

**POST** `/upload/single`

Uploads a single file to Cloudinary.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `folder` | string | No | Cloudinary folder path (default: auto-generated) |
| `resourceType` | string | No | Resource type: `image`, `video`, `raw`, `auto` (default: `auto`) |

#### Request Body

- **Content-Type**: `multipart/form-data`
- **Field**: `file` - The file to upload

#### Response

```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/folder/filename.jpg",
  "publicId": "folder/filename",
  "format": "jpg",
  "size": 1024000,
  "originalName": "original-filename.jpg",
  "uploadedAt": "2023-09-29T04:34:03.000Z"
}
```

#### Example Usage

```bash
curl -X POST \
  'http://localhost:9000/upload/single?folder=theSkillClub/companies/logos&resourceType=image' \
  -F 'file=@/path/to/your/image.jpg'
```

### Upload Multiple Files

**POST** `/upload/multiple`

Uploads multiple files to Cloudinary.

#### Query Parameters

Same as single file upload.

#### Request Body

- **Content-Type**: `multipart/form-data`
- **Field**: `files` - Array of files to upload (max 10 files)

#### Response

```json
[
  {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/folder/file1.jpg",
    "publicId": "folder/file1",
    "format": "jpg",
    "size": 1024000,
    "originalName": "file1.jpg",
    "uploadedAt": "2023-09-29T04:34:03.000Z"
  },
  {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/folder/file2.jpg",
    "publicId": "folder/file2",
    "format": "jpg",
    "size": 2048000,
    "originalName": "file2.jpg",
    "uploadedAt": "2023-09-29T04:34:03.000Z"
  }
]
```

## Folder Structure

The system uses an organized folder structure in Cloudinary:

```
theSkillClub/
├── companies/
│   └── logos/          # Company logos for assessments
├── profiles/
│   └── images/         # User profile images
├── documents/          # Documents and PDFs
├── assessments/        # Assessment-related files
├── certificates/       # Certificates
├── resumes/           # Resume files
├── portfolio/         # Portfolio items
└── misc/              # Other files
```

## File Validation

### Size Limits

- **Single File**: Maximum 10MB
- **Multiple Files**: Maximum 50MB total, 10MB per file
- **File Count**: Maximum 10 files per request

### Supported Formats

The API accepts various file formats based on resource type:

- **Images**: JPG, JPEG, PNG, GIF, BMP, WEBP, SVG, TIFF, ICO, HEIC, HEIF
- **Documents**: PDF, DOC, DOCX, TXT
- **Videos**: MP4, AVI, MOV, WMV (when resourceType is 'video')
- **Raw Files**: Any format (when resourceType is 'raw')

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "File validation failed: File size must not exceed 10MB",
  "error": "Bad Request"
}
```

### 413 Payload Too Large

```json
{
  "statusCode": 413,
  "message": "Total file size exceeds 50MB limit",
  "error": "Payload Too Large"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Upload failed: Cloudinary configuration error",
  "error": "Internal Server Error"
}
```

## Frontend Integration

### React Component Usage

```tsx
import FileUpload from "@/modules/shared/components/file-upload";
import { UploadResult } from "@/lib/services/file-upload";

function MyComponent() {
  const handleFileUploaded = (result: UploadResult) => {
    console.log('File uploaded:', result.url);
    // Update form field or state with the file URL
  };

  const handleFileRemoved = () => {
    console.log('File removed');
    // Clear form field or state
  };

  return (
    <FileUpload
      onFileUploaded={handleFileUploaded}
      onFileRemoved={handleFileRemoved}
      accept={{
        'image/*': ['.jpeg', '.jpg', '.png']
      }}
      maxSize={2 * 1024 * 1024} // 2MB
      folder="theSkillClub/companies/logos"
      resourceType="image"
      placeholder="Click to upload company logo"
    />
  );
}
```

### Service Layer Usage

```typescript
import { fileUploadService } from "@/lib/services/file-upload";

async function uploadFile(file: File) {
  try {
    const result = await fileUploadService.uploadSingleFile(file, {
      folder: 'theSkillClub/documents',
      resourceType: 'raw'
    });
    
    console.log('Upload successful:', result.url);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

## Environment Configuration

### Backend (.env)

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (.env.local)

```env
# Backend API URL
NEXT_PUBLIC_SERVER_URL=http://localhost:9000
```

## Security Considerations

1. **File Validation**: Always validate file types and sizes on both client and server
2. **Authentication**: Add authentication middleware for production use
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Virus Scanning**: Consider adding virus scanning for uploaded files
5. **Access Control**: Implement proper access control for file operations

## Testing

### Manual Testing

1. Start the backend server: `npm run start:dev`
2. Use the test script: `node test-file-upload.js`
3. Test through the frontend assessment form

### Automated Testing

```bash
# Run the test script
node test-file-upload.js

# Test with curl
curl -X POST \
  'http://localhost:9000/upload/single?folder=test&resourceType=raw' \
  -F 'file=@test-file.txt'
```

## Troubleshooting

### Common Issues

1. **Cloudinary Configuration Error**
   - Ensure all CLOUDINARY_* environment variables are set
   - Verify Cloudinary credentials are correct

2. **File Size Exceeded**
   - Check file size limits in validation
   - Adjust limits if needed for your use case

3. **CORS Issues**
   - Ensure CORS is properly configured for your frontend domain

4. **Upload Timeout**
   - Check network connection
   - Consider increasing timeout for large files

### Debug Mode

Enable debug logging by setting:

```env
LOG_LEVEL=debug
```

This will provide detailed logs for troubleshooting upload issues.
