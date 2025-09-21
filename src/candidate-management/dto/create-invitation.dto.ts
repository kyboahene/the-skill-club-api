import { EmailTemplateType } from '@prisma/client';
import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsBoolean } from 'class-validator';

export class CreateInvitationDto {
  @IsArray()
  @IsString({ each: true })
  candidateEmails: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  candidateNames?: string[];

  @IsArray()
  @IsString({ each: true })
  assessmentIds: string[];

  @IsString()
  companyId: string;

  @IsString()
  invitedBy: string;

  @IsString()
  invitedByName: string;

  @IsOptional()
  @IsString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  maxAttempts?: number;
}



export class GetInvitationsDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsEnum(['sent', 'opened', 'started', 'completed', 'expired', 'cancelled'])
  status?: 'sent' | 'opened' | 'started' | 'completed' | 'expired' | 'cancelled';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  startAfterValue?: any;
}

export class CreateEmailTemplateDto {
  @IsString()
  name: string;

  @IsString()
  subject: string;

  @IsString()
  htmlContent: string;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsEnum(EmailTemplateType)
  type?: EmailTemplateType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
