import { ApiProperty } from '@nestjs/swagger';
import { User, Talent } from '@prisma/client';

export class TalentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  gender?: string;

  @ApiProperty({ required: false })
  linkedIn?: string;

  @ApiProperty({ required: false })
  gitPortWebsite?: string;

  @ApiProperty({ required: false })
  website?: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ required: false })
  profession?: string;

  @ApiProperty({ required: false })
  university?: string;

  @ApiProperty({ required: false })
  year?: string;

  @ApiProperty({ type: [String], required: false })
  mode?: string[];

  @ApiProperty({ required: false })
  resume?: string;

  @ApiProperty({ required: false })
  profile?: string;

  @ApiProperty()
  vetted: boolean;

  @ApiProperty()
  availability: boolean;

  @ApiProperty()
  new: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<TalentEntity>) {
    Object.assign(this, partial);
  }
}
