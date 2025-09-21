import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateEventDto {
    @IsOptional()
    @IsString()
    title?: string;
  
    @IsOptional()
    @IsString()
    image?: string;
  
    @IsOptional()
    @IsString()
    link?: string;
  
    @IsOptional()
    @IsString()
    date?: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsEnum(['LEADERSHIP', 'MENTORSHIP', 'JOB', 'CAREER_ADVICE', 'SKILLS'])
    category?: 'LEADERSHIP' | 'MENTORSHIP' | 'JOB' | 'CAREER_ADVICE' | 'SKILLS';
  }