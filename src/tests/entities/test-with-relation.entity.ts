import { ApiProperty } from '@nestjs/swagger';
import { TestCategory } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';

// Simple Question entity for relation
@Exclude()
class QuestionEntity {
  @ApiProperty({
    description: 'Unique identifier for the question',
    example: 'clxxxxx'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The question text',
    example: 'What is a closure in JavaScript?'
  })
  @Expose()
  question: string;

  @ApiProperty({
    description: 'Type of question',
    example: 'MULTIPLE_CHOICE'
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'Answer options for the question',
    example: ['A function inside another function', 'A variable', 'A loop', 'An object']
  })
  @Expose()
  options: string[];

  @ApiProperty({
    description: 'Correct answer(s)',
    example: ['A function inside another function']
  })
  @Expose()
  correctAnswers: string[];
}

// Simple TestConfig entity for relation
@Exclude()
class TestConfigEntity {
  @ApiProperty({
    description: 'Unique identifier for the test config',
    example: 'clxxxxx'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Question limit for this test configuration',
    example: 10,
    required: false
  })
  @Expose()
  questionLimit?: number;

  @ApiProperty({
    description: 'Assessment ID this config belongs to',
    example: 'clxxxxx'
  })
  @Expose()
  assessmentId: string;
}

@Exclude()
export class TestWithRelationEntity {
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

  @ApiProperty({
    description: 'Questions associated with this test',
    type: [QuestionEntity]
  })
  @Expose()
  @Type(() => QuestionEntity)
  questions: QuestionEntity[];

  @ApiProperty({
    description: 'Test configurations associated with this test',
    type: [TestConfigEntity]
  })
  @Expose()
  @Type(() => TestConfigEntity)
  testConfigs: TestConfigEntity[];
}
