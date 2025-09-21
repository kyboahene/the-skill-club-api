import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { PaginationModule } from '@/pagination/pagination.module';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
  imports: [PaginationModule]
})
export class CompaniesModule {}
