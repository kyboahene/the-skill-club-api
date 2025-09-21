import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PaginationModule } from '@/pagination/pagination.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
  imports: [PaginationModule]
})
export class EventsModule {}
