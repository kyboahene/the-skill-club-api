import { ApiProperty } from '@nestjs/swagger';
import { TestCategory } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateTestDto {

  @ApiProperty({
    description: 'Company ID',
    example: 'clxxxxx'
  })
  @IsString()
  companyId: string;

  @ApiProperty({
    description: 'Title of the test',
    example: 'JavaScript Fundamentals Test'
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Description of the test',
    example: 'A comprehensive test covering JavaScript fundamentals',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Category of the test',
    enum: TestCategory,
    example: TestCategory.SKILL
  })
  @IsEnum(TestCategory)
  category: TestCategory;

  @ApiProperty({
    description: 'Language codes supported by the test',
    example: ['en', 'fr'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  languageCodes: string[];

  @ApiProperty({
    description: 'Whether the test is validated',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  validated?: boolean = false;

  @ApiProperty({
    description: 'ID of the user/company who created the test',
    example: 'clxxxxx'
  })
  @IsString()
  createdBy: string;

  @ApiProperty({
    description: 'Version of the test',
    example: 1,
    default: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number = 1;

  @ApiProperty({
    description: 'Tags associated with the test',
    example: ['javascript', 'frontend', 'programming'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];

  @ApiProperty({
    description: 'Duration of the test in seconds',
    example: 3600,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationSeconds?: number;
}
