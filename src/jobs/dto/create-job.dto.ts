import { IsString, IsOptional, IsArray, IsEnum, IsNumber } from 'class-validator';

export class CreateJobDto {
  @IsString()
  jobTitle: string;

  @IsString()
  about: string;

  @IsString()
  companyId: string;

  @IsString()
  workLocation: string;

  @IsString()
  requirements: string;

  @IsString()
  responsibilities: string;

  @IsString()
  education: string;

  @IsOptional()
  @IsString()
  pay?: string;

  @IsOptional()
  @IsString()
  minPay?: string;

  @IsOptional()
  @IsString()
  maxPay?: string;

  @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'])
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

  @IsString()
  salary: string;

  @IsEnum(['NO_EXPERIENCE', 'ONE_YEAR', 'TWO_YEARS', 'THREE_YEARS', 'FOUR_YEARS', 'FIVE_OR_MORE_YEARS'])
  experience: 'NO_EXPERIENCE' | 'ONE_YEAR' | 'TWO_YEARS' | 'THREE_YEARS' | 'FOUR_YEARS' | 'FIVE_OR_MORE_YEARS';

  @IsOptional()
  @IsEnum(['WEB_MOBILE_DEV', 'DESIGNER', 'WRITING', 'MARKETING', 'OTHER'])
  jobCategory?: 'WEB_MOBILE_DEV' | 'DESIGNER' | 'WRITING' | 'MARKETING' | 'OTHER';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsEnum(['ACTIVE', 'CLOSED'])
  status?: 'ACTIVE' | 'CLOSED';
}

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  workLocation?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  responsibilities?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  pay?: string;

  @IsOptional()
  @IsString()
  minPay?: string;

  @IsOptional()
  @IsString()
  maxPay?: string;

  @IsOptional()
  @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'])
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsEnum(['NO_EXPERIENCE', 'ONE_YEAR', 'TWO_YEARS', 'THREE_YEARS', 'FOUR_YEARS', 'FIVE_OR_MORE_YEARS'])
  experience?: 'NO_EXPERIENCE' | 'ONE_YEAR' | 'TWO_YEARS' | 'THREE_YEARS' | 'FOUR_YEARS' | 'FIVE_OR_MORE_YEARS';

  @IsOptional()
  @IsEnum(['WEB_MOBILE_DEV', 'DESIGNER', 'WRITING', 'MARKETING', 'OTHER'])
  jobCategory?: 'WEB_MOBILE_DEV' | 'DESIGNER' | 'WRITING' | 'MARKETING' | 'OTHER';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsEnum(['ACTIVE', 'CLOSED'])
  status?: 'ACTIVE' | 'CLOSED';
}

export class GetJobsDto {
  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'])
  type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

  @IsOptional()
  @IsEnum(['REMOTE', 'ONSITE', 'HYBRID'])
  workMode?: 'REMOTE' | 'ONSITE' | 'HYBRID';

  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  startAfterValue?: any;
}
