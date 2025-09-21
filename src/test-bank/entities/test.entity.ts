import { ApiProperty } from '@nestjs/swagger';
import { TestCategory } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TestEntity {
  @ApiProperty({
    description: 'Unique identifier for the test',
    example: 'clxxxxx'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Title of the test',
    example: 'JavaScript Fundamentals Test'
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Description of the test',
    example: 'A comprehensive test covering JavaScript fundamentals',
    required: false
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Category of the test',
    enum: TestCategory,
    example: TestCategory.SKILL
  })
  @Expose()
  category: TestCategory;

  @ApiProperty({
    description: 'Language codes supported by the test',
    example: ['en', 'fr'],
    type: [String]
  })
  @Expose()
  languageCodes: string[];

  @ApiProperty({
    description: 'Whether the test is validated',
    example: false
  })
  @Expose()
  validated: boolean;

  @ApiProperty({
    description: 'ID of the user/company who created the test',
    example: 'clxxxxx'
  })
  @Expose()
  createdBy: string;

  @ApiProperty({
    description: 'Version of the test',
    example: 1
  })
  @Expose()
  version: number;

  @ApiProperty({
    description: 'Tags associated with the test',
    example: ['javascript', 'frontend', 'programming'],
    type: [String]
  })
  @Expose()
  tags: string[];

  @ApiProperty({
    description: 'Duration of the test in seconds',
    example: 3600,
    required: false
  })
  @Expose()
  durationSeconds?: number;

  @ApiProperty({
    description: 'Date when the test was created',
    example: '2023-01-01T00:00:00.000Z'
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the test was last updated',
    example: '2023-01-01T00:00:00.000Z'
  })
  @Expose()
  updatedAt: Date;
}
