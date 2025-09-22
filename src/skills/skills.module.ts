import { Module } from '@nestjs/common';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { PaginationModule } from '@/pagination/pagination.module';

@Module({
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
  imports: [PaginationModule]
})
export class SkillsModule {}
