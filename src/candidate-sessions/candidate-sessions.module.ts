import { Module } from '@nestjs/common';
import { CandidateSessionsController } from './candidate-sessions.controller';
import { CandidateSessionsService } from './candidate-sessions.service';

@Module({
  controllers: [CandidateSessionsController],
  providers: [CandidateSessionsService],
  exports: [CandidateSessionsService],
})
export class CandidateSessionsModule {}
