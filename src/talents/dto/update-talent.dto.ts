import { IsString, IsOptional, IsArray, IsObject, IsEnum } from 'class-validator';

export class UpdateTalentProfileDto {
    @IsOptional()
    @IsString()
    bio?: string;
  
    @IsOptional()
    @IsString()
    location?: string;
  
    @IsOptional()
    @IsString()
    phone?: string;
  
    @IsOptional()
    @IsString()
    linkedIn?: string;
  
    @IsOptional()
    @IsString()
    github?: string;
  
    @IsOptional()
    @IsString()
    portfolio?: string;
  
    @IsOptional()
    @IsString()
    resume?: string;
  
    @IsOptional()
    @IsArray()
    skills?: string[];
  
    @IsOptional()
    @IsArray()
    workHistory?: any[];
  
    @IsOptional()
    @IsArray()
    education?: any[];
  
    @IsOptional()
    @IsArray()
    projects?: any[];
  
    @IsOptional()
    @IsArray()
    certificates?: any[];
  
    @IsOptional()
    @IsObject()
    preferences?: any;
  }