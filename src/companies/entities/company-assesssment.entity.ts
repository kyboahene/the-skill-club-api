import { ApiProperty } from '@nestjs/swagger';

export class CompanyAssessmentEntity {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;
  description: string;

  @ApiProperty({ type: String })
  createdBy: string;

  @ApiProperty({ type: Date })
    createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}