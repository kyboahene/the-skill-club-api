import { ApiProperty } from '@nestjs/swagger';
import { EventEntity } from './event.entity';

export class EventWithRelationEntity extends EventEntity {
  // Events model doesn't have relations in the current schema
  // but this structure is ready for future relations
  
  constructor(partial: Partial<EventWithRelationEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
