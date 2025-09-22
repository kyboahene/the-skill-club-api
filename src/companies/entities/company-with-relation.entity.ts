import { ApiProperty } from '@nestjs/swagger';
import { CompanyEntity } from './company.entity';
import { UserEntity } from '@/users/entities/user.entity';

export class CompanyWithRelationEntity extends CompanyEntity {
  @ApiProperty({ type: [Object], required: false })
  companyUsers?: UserEntity[];

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
}
