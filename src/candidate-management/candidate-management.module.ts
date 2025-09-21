import { Module } from '@nestjs/common';
import { CandidateManagementController } from './candidate-management.controller';
import { CandidateManagementService } from './candidate-management.service';

@Module({
  controllers: [CandidateManagementController],
  providers: [CandidateManagementService],
  exports: [CandidateManagementService],
})
export class CandidateManagementModule {}
