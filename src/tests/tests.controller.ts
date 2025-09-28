import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiBadRequestResponse, ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { Auth } from '@/auth/decorator';

import { TestsService } from './tests.service';

import { Serialize } from '@/shared/interceptors/serializer.interceptor';

import { CreateTestDto, UpdateTestDto, GetTestsDto } from './dto';
import { PaginatedResponseDto } from '@/pagination/pagination.entity';
import { TestWithRelationEntity, TestEntity } from './entities';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { CompanyEntity } from '@/companies/entities';

@ApiTags('Tests')
@ApiBearerAuth()
@Controller('tests')
export class TestsController {
  constructor(private testsService: TestsService) { }

  @Auth(['add_test', 'add_test_global'])
  @Post()
  @Serialize(TestWithRelationEntity)
  @ApiOperation({
    summary: "Creates and returns created test",
    description: 'Required permissions: "add_test" or "add_test_global"',
  })
  @ApiCreatedResponse({
    description: "Created test object as response",
    type: TestWithRelationEntity
  })
  @ApiBadRequestResponse({
    description: 'Test cannot be created. Try again!'
  })
  create(@Body() data: CreateTestDto) {
    return this.testsService.createTest(data);
  }

  @Auth(['get_tests', 'get_tests_global'])
  @Get()
  @Serialize(PaginatedResponseDto(TestWithRelationEntity))
  @ApiOperation({
    summary: "Returns a paginated list of tests",
    description: 'Required permissions: "get_tests" or "get_tests_global"',
  })
  @ApiCreatedResponse({
    description: "Returns a paginated list of tests",
    type: PaginatedResponseDto(TestWithRelationEntity)
  })
  @ApiBadRequestResponse({
    description: 'Tests cannot be retrieved. Try again!'
  })
  findAll(
    @GetUser("company") company: CompanyEntity,
    @Query("pageNum") page: string = "1",
    @Query("pageSize") pageSize: string = "10",
    @Query("all") all: string = "false",
    @Query("category") category?: string,
    @Query("search") search?: string
  ) {
    return this.testsService.findTests(company.id, +page, +pageSize, JSON.parse(all), category, search);
  }

  @Auth(['get_test', 'get_test_global'])
  @Get(':id')
  @Serialize(TestWithRelationEntity)
  @ApiOperation({
    summary: "Returns a single test by id",
    description: 'Required permissions: "get_test" or "get_test_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a single test',
    type: TestWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Test cannot be retrieved. Try again!'
  })
  findOne(@Param('id') id: string) {
    return this.testsService.getTestById(id);
  }

  @Auth(['get_tests_by_company', 'get_tests_by_company_global'])
  @Get('company/:companyId')
  @Serialize(TestWithRelationEntity)
  @ApiOperation({
    summary: "Returns tests created by a specific company",
    description: 'Required permissions: "get_tests_by_company" or "get_tests_by_company_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns tests created by a company',
    type: [TestWithRelationEntity],
  })
  @ApiBadRequestResponse({
    description: 'Tests cannot be retrieved. Try again!'
  })
  getTestsByCompany(@Param('companyId') companyId: string) {
    return this.testsService.getTestsByCompany(companyId);
  }

  @Auth(['get_tests_by_ids', 'get_tests_by_ids_global'])
  @Post('by-ids')
  @Serialize(TestWithRelationEntity)
  @ApiOperation({
    summary: "Returns tests by array of IDs",
    description: 'Required permissions: "get_tests_by_ids" or "get_tests_by_ids_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns tests by IDs',
    type: [TestWithRelationEntity],
  })
  @ApiBadRequestResponse({
    description: 'Tests cannot be retrieved. Try again!'
  })
  getTestsByIds(@Body() data: { testIds: string[] }) {
    return this.testsService.getTestsByIds(data.testIds);
  }

  @Auth(['update_test', 'update_test_global'])
  @Patch(':id')
  @Serialize(TestWithRelationEntity)
  @ApiCreatedResponse({
    description: "Returns updated test",
    type: TestWithRelationEntity,
  })
  @ApiOperation({
    summary: "Updates a test by id and returns it",
    description: 'Required permissions: "update_test" or "update_test_global"',
  })
  @ApiBadRequestResponse({
    description: 'Test cannot be updated. Try again!'
  })
  update(@Param('id') id: string, @Body() data: UpdateTestDto) {
    return this.testsService.updateTest(id, data);
  }

  @Auth(['delete_test', 'delete_test_global'])
  @Delete(':id')
  @ApiCreatedResponse({
    description: 'Returns deleted test',
    type: TestEntity,
  })
  @ApiOperation({
    summary: 'Deletes a test by id and returns it',
    description: 'Required permissions: "delete_test" or "delete_test_global"',
  })
  @ApiBadRequestResponse({
    description: 'Test cannot be deleted. Try again!'
  })
  remove(@Param('id') id: string) {
    return this.testsService.deleteTest(id);
  }

  // Question Management Endpoints
  @Auth(['add_question', 'add_question_global'])
  @Post(':testId/questions')
  @ApiOperation({
    summary: "Creates a single question for a test",
    description: 'Required permissions: "add_question" or "add_question_global"',
  })
  @ApiCreatedResponse({
    description: "Created question object as response",
  })
  @ApiBadRequestResponse({
    description: 'Question cannot be created. Try again!'
  })
  createQuestion(
    @Param('testId') testId: string,
    @Body() data: {
      type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN_ENDED' | 'CODING' | 'VIDEO_RESPONSE';
      prompt: string;
      options?: string[];
      correctAnswer?: any;
      maxScore?: number;
      codeLanguage?: string;
      timeLimitSeconds?: number;
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    }
  ) {
    return this.testsService.createQuestion(testId, data);
  }

  @Auth(['add_question', 'add_question_global'])
  @Post(':testId/questions/bulk')
  @ApiOperation({
    summary: "Creates multiple questions for a test",
    description: 'Required permissions: "add_question" or "add_question_global"',
  })
  @ApiCreatedResponse({
    description: "Bulk creation result with created questions",
  })
  @ApiBadRequestResponse({
    description: 'Questions cannot be created. Try again!'
  })
  bulkCreateQuestions(
    @Param('testId') testId: string,
    @Body() data: {
      questions: Array<{
        type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN_ENDED' | 'CODING' | 'VIDEO_RESPONSE';
        prompt: string;
        options?: string[];
        correctAnswer?: any;
        maxScore?: number;
        codeLanguage?: string;
        timeLimitSeconds?: number;
        difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
      }>;
    }
  ) {
    return this.testsService.bulkCreateQuestions(testId, data.questions);
  }

  @Auth(['get_questions', 'get_questions_global'])
  @Get(':testId/questions')
  @ApiOperation({
    summary: "Returns all questions for a test",
    description: 'Required permissions: "get_questions" or "get_questions_global"',
  })
  @ApiCreatedResponse({
    description: "Returns questions for a test",
  })
  @ApiBadRequestResponse({
    description: 'Questions cannot be retrieved. Try again!'
  })
  getQuestionsByTest(@Param('testId') testId: string) {
    return this.testsService.getQuestionsByTest(testId);
  }

  @Auth(['update_question', 'update_question_global'])
  @Patch('questions/:questionId')
  @ApiOperation({
    summary: "Updates a question by id",
    description: 'Required permissions: "update_question" or "update_question_global"',
  })
  @ApiCreatedResponse({
    description: "Returns updated question",
  })
  @ApiBadRequestResponse({
    description: 'Question cannot be updated. Try again!'
  })
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() data: {
      type?: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN_ENDED' | 'CODING' | 'VIDEO_RESPONSE';
      prompt?: string;
      options?: string[];
      correctAnswer?: any;
      maxScore?: number;
      codeLanguage?: string;
      timeLimitSeconds?: number;
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    }
  ) {
    return this.testsService.updateQuestion(questionId, data);
  }

  @Auth(['delete_question', 'delete_question_global'])
  @Delete('questions/:questionId')
  @ApiOperation({
    summary: 'Deletes a question by id',
    description: 'Required permissions: "delete_question" or "delete_question_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns deleted question',
  })
  @ApiBadRequestResponse({
    description: 'Question cannot be deleted. Try again!'
  })
  deleteQuestion(@Param('questionId') questionId: string) {
    return this.testsService.deleteQuestion(questionId);
  }
}
