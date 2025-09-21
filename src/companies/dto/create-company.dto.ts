import { IsString, IsOptional, IsBoolean, IsObject, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  market?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  totalRaised?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  linkedIn?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  foundedDate?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  remotePolicy?: string;

  @IsOptional()
  @IsObject()
  integrationSettings?: any;
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  market?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  totalRaised?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  linkedIn?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  foundedDate?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  remotePolicy?: string;

  @IsOptional()
  @IsObject()
  integrationSettings?: any;

  @IsOptional()
  @IsBoolean()
  new?: boolean;
}

export class GetCompaniesDto {
  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  market?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  startAfterValue?: any;
}

export class CreateCompanyWithOwnerDto {
  @IsString()
  userId: string;

  @IsString()
  email: string;

  @IsString()
  companyName: string;

  @IsString()
  userName: string;
}

export class AddCompanyUserDto {
  @IsString()
  companyId: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  senderEmail: string;

  @IsEnum(['admin', 'recruiter', 'hr_manager'])
  role: 'admin' | 'recruiter' | 'hr_manager';

  @IsString()
  invitedBy: string;
}

export class UpdateCompanyUserDto {
  @IsOptional()
  @IsEnum(['admin', 'recruiter', 'hr_manager'])
  role?: 'admin' | 'recruiter' | 'hr_manager';

  @IsOptional()
  @IsEnum(['active', 'invited', 'suspended'])
  status?: 'active' | 'invited' | 'suspended';

  @IsOptional()
  @IsObject()
  permissions?: any;
}
