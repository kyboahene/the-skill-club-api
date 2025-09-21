import { ApiProperty } from '@nestjs/swagger';
import { CompanyEntity } from './company.entity';

export class CompanyWithRelationEntity extends CompanyEntity {
  @ApiProperty({ type: [Object], required: false })
  users?: any[];

  @ApiProperty({ type: [Object], required: false })
  jobs?: any[];

  @ApiProperty({ type: [Object], required: false })
  assessments?: any[];

  @ApiProperty({ type: [Object], required: false })
  invitations?: any[];

  @ApiProperty({ type: [Object], required: false })
  emailTemplates?: any[];

  @ApiProperty({ type: [Object], required: false })
  emailCampaigns?: any[];

  @ApiProperty({ type: [Object], required: false })
  applications?: any[];

  @ApiProperty({ type: Object, required: false })
  _count?: {
    users?: number;
    jobs?: number;
    assessments?: number;
    invitations?: number;
    applications?: number;
  };

  constructor(partial: Partial<CompanyWithRelationEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
