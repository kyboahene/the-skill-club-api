import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CSV_UPLOAD_QUEUE } from '@/constants';

@Injectable()
export class QueueHealthService {
  private readonly logger = new Logger(QueueHealthService.name);

  constructor(
    @InjectQueue(CSV_UPLOAD_QUEUE) private csvUploadQueue: Queue,
    // Add other queues here
  ) {
    this.setupQueueErrorHandlers();
  }

  private setupQueueErrorHandlers() {
    // Monitor CSV upload queue
    this.csvUploadQueue.on('error', (error) => {
      this.logger.error(`CSV Upload Queue Error: ${error.message}`, error.stack);
    });

    this.csvUploadQueue.on('failed', (job, error) => {
      this.logger.error(
        `Job ${job.id} in CSV Upload Queue failed: ${error.message}`,
        error.stack,
      );
    });

    this.csvUploadQueue.on('stalled', (job) => {
      this.logger.warn(`Job ${job.id} in CSV Upload Queue has stalled`);
    });
  }

  async getQueueHealth() {
    try {
      const csvQueueStatus = await this.getQueueStatus(this.csvUploadQueue);
      
      return {
        csvUploadQueue: csvQueueStatus,
      };
    } catch (error) {
      this.logger.error('Failed to get queue health', error.stack);
      throw error;
    }
  }

  private async getQueueStatus(queue: Queue) {
    const [active, waiting, completed, failed] = await Promise.all([
      queue.getActiveCount(),
      queue.getWaitingCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);

    return {
      active,
      waiting,
      completed,
      failed,
    };
  }
}
