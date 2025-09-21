import { ApiProperty } from '@nestjs/swagger';
import { TalentEntity } from './talent.entity';

export class TalentWithRelationEntity extends TalentEntity {
  @ApiProperty({ type: Object, required: false })
  user?: any;

  @ApiProperty({ type: [Object], required: false })
  skills?: any[];

  @ApiProperty({ type: [Object], required: false })
  workHistory?: any[];

  @ApiProperty({ type: [Object], required: false })
  education?: any[];

  @ApiProperty({ type: [Object], required: false })
  personalProjects?: any[];

  @ApiProperty({ type: [Object], required: false })
  certificates?: any[];

  @ApiProperty({ type: [Object], required: false })
  applications?: any[];

  constructor(partial: Partial<TalentWithRelationEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
