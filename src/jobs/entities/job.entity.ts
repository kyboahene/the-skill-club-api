import { ApiProperty } from '@nestjs/swagger';
import { JobStatus, JobType, JobCategory, Experience, Remote } from '@prisma/client';

export class JobEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  jobTitle: string;

  @ApiProperty({ enum: JobStatus })
  status: JobStatus;

  @ApiProperty({ enum: JobCategory, required: false })
  jobCategory?: JobCategory;

  @ApiProperty()
  workLocation: string;

  @ApiProperty()
  requirements: string;

  @ApiProperty()
  responsibilities: string;

  @ApiProperty()
  education: string;

  @ApiProperty({ required: false })
  pay?: string;

  @ApiProperty({ required: false })
  minPay?: string;

  @ApiProperty({ required: false })
  maxPay?: string;

  @ApiProperty({ enum: JobType })
  jobType: JobType;

  @ApiProperty()
  about: string;

  @ApiProperty()
  salary: string;

  @ApiProperty({ enum: Experience })
  experience: Experience;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<JobEntity>) {
    Object.assign(this, partial);
  }
}
