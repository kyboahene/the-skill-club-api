import { ApiProperty } from '@nestjs/swagger';
import { TestCategory } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class GetTestsDto {
  @ApiProperty({
    description: 'Search term to filter tests by title, description, or tags',
    required: false,
    example: 'javascript'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter tests by category',
    enum: TestCategory,
    required: false,
    example: TestCategory.SKILL
  })
  @IsOptional()
  @IsEnum(TestCategory)
  category?: TestCategory;

  @ApiProperty({
    description: 'Filter tests by creator (company/user ID)',
    required: false,
    example: 'clxxxxx'
  })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({
    description: 'Filter tests by validation status',
    required: false,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  validated?: boolean;
}
