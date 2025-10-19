import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum, IsArray, IsNumber, IsBoolean } from 'class-validator';

export class CreateCandidateSessionDto {
  @ApiProperty({
    example: 'John Doe',
  })
  @IsString()
  candidateName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
  })
  @IsString()
  assessmentId: string;

  @ApiProperty({
    example: 'john.doe@example.com',
  })
  @IsString()
  candidateEmail: string;

  @ApiProperty({
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  candidatePhone?: string;

  @ApiProperty({
    example: 'NOT_STARTED',
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
  })
  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'])
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
}

export class UpdateCandidateSessionDto extends PartialType(CreateCandidateSessionDto) {
  @IsOptional()
  @IsString()
  startedAt?: string;

  @IsOptional()
  @IsString()
  completedAt?: string;

  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @IsOptional()
  @IsObject()
  sessionBehavior?: any;

  @IsOptional()
  @IsObject()
  antiCheatData?: any;

  @IsOptional()
  @IsArray()
  violations?: any[];
}

export class CreateAnswerDto {
  @IsString()
  candidateSessionId: string;

  @IsString()
  questionId: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
  
}

export class GetCandidateSessionsDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;

  @IsOptional()
  all?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  candidateId?: string;

  @IsOptional()
  @IsString()
  assessmentId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'])
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

  @IsOptional()
  startAfterValue?: any;
}
