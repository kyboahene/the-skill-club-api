import { ApiProperty } from '@nestjs/swagger';
import { JobEntity } from './job.entity';

export class JobWithRelationEntity extends JobEntity {
  @ApiProperty({ type: Object, required: false })
  company?: any;

  @ApiProperty({ type: [Object], required: false })
  skills?: any[];

  @ApiProperty({ type: [Object], required: false })
  applications?: any[];

  @ApiProperty({ type: [Object], required: false })
  interviews?: any[];

  @ApiProperty({ type: Object, required: false })
  _count?: {
    applications?: number;
    interviews?: number;
  };

  constructor(partial: Partial<JobWithRelationEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
