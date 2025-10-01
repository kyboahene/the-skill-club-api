import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class PdfService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.cloudconvert.com/v2';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('CLOUDCONVERT_API_KEY');
    if (!this.apiKey) {
      throw new Error('CLOUDCONVERT_API_KEY is not configured');
    }
  }

  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      // Step 1: Create a job
      const jobResponse = await axios.post(
        `${this.baseUrl}/jobs`,
        {
          tasks: {
            'import-pdf': {
              operation: 'import/upload',
            },
            'convert-to-txt': {
              operation: 'convert',
              input: 'import-pdf',
              output_format: 'txt',
            },
            'export-txt': {
              operation: 'export/url',
              input: 'convert-to-txt',
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const job = jobResponse.data.data;
      const importTask = job.tasks.find((t) => t.name === 'import-pdf');

      // Step 2: Upload the PDF
      const formData = new FormData();
      
      // Add all form parameters from CloudConvert
      const formParams = importTask.result.form.parameters;
      Object.keys(formParams).forEach(key => {
        formData.append(key, formParams[key]);
      });
      
      // Add the file last
      formData.append('file', buffer, 'document.pdf');

      await axios.post(
        importTask.result.form.url,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );

      // Step 3: Wait for conversion to complete
      let completedJob;
      let attempts = 0;
      const maxAttempts = 60; // Wait up to 60 seconds

      while (attempts < maxAttempts) {
        const statusResponse = await axios.get(
          `${this.baseUrl}/jobs/${job.id}`,
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
            },
          },
        );

        completedJob = statusResponse.data.data;
        const exportTask = completedJob.tasks.find((t) => t.name === 'export-txt');

        if (exportTask.status === 'finished') {
          break;
        }

        if (exportTask.status === 'error') {
          throw new Error('CloudConvert conversion failed');
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('CloudConvert conversion timeout');
      }

      // Step 4: Download the result
      const exportTask = completedJob.tasks.find((t) => t.name === 'export-txt');
      const downloadUrl = exportTask.result.files[0].url;

      const textResponse = await axios.get(downloadUrl);
      return textResponse.data;
    } catch (error) {
      console.error('Error converting PDF with CloudConvert:', error);
      throw new InternalServerErrorException(
        `Failed to extract text from PDF: ${error.message}`,
      );
    }
  }
}
