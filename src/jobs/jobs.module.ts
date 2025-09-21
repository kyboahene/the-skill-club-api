import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PaginationModule } from '@/pagination/pagination.module';

@Module({
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
  imports: [PaginationModule]
})
export class JobsModule {}
