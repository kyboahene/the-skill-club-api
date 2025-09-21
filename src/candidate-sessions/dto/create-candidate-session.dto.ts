import { IsString, IsOptional, IsObject, IsEnum, IsArray, IsNumber, IsBoolean } from 'class-validator';

export class CreateCandidateSessionDto {
  @IsString()
  candidateId: string;

  @IsString()
  assessmentId: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'])
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

  @IsOptional()
  @IsObject()
  deviceInfo?: any;

  @IsOptional()
  @IsObject()
  browserInfo?: any;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class UpdateCandidateSessionDto {
  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'])
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

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
