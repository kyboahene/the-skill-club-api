import { ApiProperty } from '@nestjs/swagger';

export class CompanyEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  logo?: string;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  market?: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ required: false })
  totalRaised?: string;

  @ApiProperty({ required: false })
  website?: string;

  @ApiProperty({ required: false })
  overview?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  linkedIn?: string;

  @ApiProperty({ required: false })
  twitter?: string;

  @ApiProperty({ required: false })
  foundedDate?: string;

  @ApiProperty({ required: false })
  companySize?: string;

  @ApiProperty({ required: false })
  remotePolicy?: string;

  @ApiProperty()
  new: boolean;

  @ApiProperty({ required: false })
  integrationSettings?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<CompanyEntity>) {
    Object.assign(this, partial);
  }
}
