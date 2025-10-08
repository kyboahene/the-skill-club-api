import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { PaginationModule } from '@/pagination/pagination.module';
import { CompanyAssessmentService } from './company-assessment.service';
import { CandidateSessionsModule } from '../candidate-sessions/candidate-sessions.module';
import { SendEmailsModule } from '@/send-emails/send-emails.module';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyAssessmentService],
  exports: [CompaniesService, CompanyAssessmentService],
  imports: [PaginationModule, CandidateSessionsModule, SendEmailsModule]
})
export class CompaniesModule {}
