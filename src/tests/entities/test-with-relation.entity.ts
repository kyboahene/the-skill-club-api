import { ApiProperty } from '@nestjs/swagger';
import { TestCategory } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { TestEntity } from './test.entity';

// Simple Question entity for relation
class QuestionEntity {
  @ApiProperty({
    description: 'Unique identifier for the question',
    example: 'clxxxxx'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The question prompt/text',
    example: 'What is a closure in JavaScript?'
  })
  @Expose()
  prompt: string;

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
  correctAnswer: any;

  @ApiProperty({
    description: 'Maximum score for this question',
    example: 10
  })
  @Expose()
  maxScore?: number;

  @ApiProperty({
    description: 'Difficulty level',
    example: 'MEDIUM'
  })
  @Expose()
  difficulty?: string;

  @ApiProperty({
    description: 'Time limit in seconds',
    example: 300
  })
  @Expose()
  timeLimitSeconds?: number;

  @ApiProperty({
    description: 'Code language for coding questions',
    example: 'javascript'
  })
  @Expose()
  codeLanguage?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

// Simple TestConfig entity for relation
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

export class TestWithRelationEntity extends TestEntity {
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
