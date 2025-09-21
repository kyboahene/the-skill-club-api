import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssessmentDto {
  @IsString()
  question: string;

  @IsArray()
  @IsString({ each: true })
  alternatives: string[];

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsString()
  skill?: string;
}

export class GetAssessmentsPerSkillDto {
  @IsString()
  skill: string;

  @IsOptional()
  limitCount?: number;

  @IsOptional()
  startAfterValue?: any;

  @IsOptional()
  @IsString()
  search?: string;
}

export class UpdateAssessmentDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternatives?: string[];

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsString()
  skill?: string;
}
