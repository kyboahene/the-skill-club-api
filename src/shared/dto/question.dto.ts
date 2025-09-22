import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsNotEmpty,
  MaxLength,
  Min,
  IsObject,
} from 'class-validator';
import { QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  @IsOptional()
  @IsString()
  testId?: string;

  @IsOptional()
  @IsString()
  assessmentId?: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  prompt: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsOptional()
  @IsObject()
  correctAnswer?: any;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxScore?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  codeLanguage?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  timeLimitSeconds?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  difficulty?: string; // e.g., "Easy", "Medium", "Hard"
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  prompt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsObject()
  correctAnswer?: any;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxScore?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  codeLanguage?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  timeLimitSeconds?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  difficulty?: string; // e.g., "Easy", "Medium", "Hard"
}