import { ApiProperty } from '@nestjs/swagger';
import { EventCategory } from '@prisma/client';

export class EventEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  link: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: EventCategory })
  category: EventCategory;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<EventEntity>) {
    Object.assign(this, partial);
  }
}
