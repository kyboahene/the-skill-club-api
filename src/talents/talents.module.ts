import { Module } from '@nestjs/common';
import { TalentsController } from './talents.controller';
import { TalentsService } from './talents.service';
import { PaginationModule } from '@/pagination/pagination.module';

@Module({
  controllers: [TalentsController],
  providers: [TalentsService],
  exports: [TalentsService],
  imports: [PaginationModule]
})
export class TalentsModule {}
