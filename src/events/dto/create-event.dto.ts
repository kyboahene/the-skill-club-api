import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  image: string;

  @IsString()
  link: string;

  @IsString()
  date: string;

  @IsString()
  description: string;

  @IsEnum(['LEADERSHIP', 'MENTORSHIP', 'JOB', 'CAREER_ADVICE', 'SKILLS'])
  category: 'LEADERSHIP' | 'MENTORSHIP' | 'JOB' | 'CAREER_ADVICE' | 'SKILLS';
}



export class GetEventsDto {
  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  startAfterValue?: any;
}
