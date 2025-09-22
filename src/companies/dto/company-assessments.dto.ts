import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  IsDateString,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from '@/shared/dto/question.dto';

export class BrandingSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7) // Hex color code length
  themeColorHex?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fontFamily?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  welcomeText?: string;
}

export class AntiCheatSettingsDto {
  @IsOptional()
  @IsBoolean()
  blockCopyPaste?: boolean;

  @IsOptional()
  @IsBoolean()
  disableRightClick?: boolean;

  @IsOptional()
  @IsBoolean()
  detectWindowFocus?: boolean;

  @IsOptional()
  @IsBoolean()
  detectTabSwitching?: boolean;

  @IsOptional()
  @IsBoolean()
  enableFullscreen?: boolean;

  @IsOptional()
  @IsBoolean()
  preventScreenCapture?: boolean;

  @IsOptional()
  @IsBoolean()
  enableScreenRecording?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  screenRecordingInterval?: number;
}

export class CreateCompanyAssessmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsNotEmpty()
  ownerCompanyId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  maxTests?: number = 5;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxCustomQuestions?: number = 20;

  @IsOptional()
  @ValidateNested()
  @Type(() => BrandingSettingsDto)
  brandingSettings?: BrandingSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AntiCheatSettingsDto)
  antiCheatSettings?: AntiCheatSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateQuestionDto)
  customQuestions?: CreateQuestionDto[];

  @IsArray()
  @IsString({ each: true })
  languageCodes: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  timeLimitSeconds?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  timeLimitMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passMark?: number = 70;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @IsOptional()
  @IsString()
  createdBy?: string;
}