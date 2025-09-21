import { Module } from '@nestjs/common';
import { TestBankService } from './test-bank.service';
import { TestBankController } from './test-bank.controller';
import { PaginationModule } from '@/pagination/pagination.module';

@Module({
  imports: [PaginationModule],
  controllers: [TestBankController],
  providers: [TestBankService],
  exports: [TestBankService],
})
export class TestBankModule {}
