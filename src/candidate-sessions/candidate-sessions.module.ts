import { Module } from '@nestjs/common';
import { CandidateSessionsController } from './candidate-sessions.controller';
import { CandidateSessionsService } from './candidate-sessions.service';
import { PaginationModule } from '@/pagination/pagination.module';

@Module({
  controllers: [CandidateSessionsController],
  providers: [CandidateSessionsService],
  exports: [CandidateSessionsService],
  imports: [PaginationModule],
})
export class CandidateSessionsModule {}
