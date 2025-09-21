import { IsString, IsOptional, IsArray } from 'class-validator';

export class GetTalentsDto {
    @IsOptional()
    limit?: number;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];
  
    @IsOptional()
    @IsString()
    location?: string;
  
    @IsOptional()
    @IsString()
    experienceLevel?: string;
  
    @IsOptional()
    @IsString()
    search?: string;
  
    @IsOptional()
    all?: boolean;
  
    @IsOptional()
    page?: number;
  
    @IsOptional()
    pageSize?: number;
  
  }