import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { PaginationModule } from '@/pagination/pagination.module';
import { CompanyAssessmentService } from './company-assessment.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyAssessmentService],
  exports: [CompaniesService],
  imports: [PaginationModule]
})
export class CompaniesModule {}
