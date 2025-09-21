import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiBadRequestResponse, ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { Auth } from '@/auth/decorator';

import { TestBankService } from './test-bank.service';


import { Serialize } from '@/shared/interceptors/serializer.interceptor';

import { CreateTestDto, UpdateTestDto, GetTestsDto } from './dto';
import { PaginatedResponseDto } from '@/pagination/pagination.entity';
import { TestWithRelationEntity, TestEntity } from './entities';

@ApiTags('Test Bank')
@ApiBearerAuth()
@Controller('test-bank')
export class TestBankController {
  constructor(private testBankService: TestBankService) { }

  @Auth(['add_test_bank', 'add_test_bank_global'])
  @Post()
  @Serialize(TestWithRelationEntity)
  @ApiOperation({
    summary: "Creates and returns created test",
    description: 'Required permissions: "add_test_bank" or "add_test_bank_global"',
  })
  @ApiCreatedResponse({
    description: "Created test object as response",
    type: TestWithRelationEntity
  })
  @ApiBadRequestResponse({
    description: 'Test cannot be created. Try again!'
  })
  create(@Body() data: CreateTestDto) {
    return this.testBankService.createTest(data);
  }

  @Auth(['get_tests_bank', 'get_tests_bank_global'])
  @Get()
  @Serialize(PaginatedResponseDto(TestWithRelationEntity))
  @ApiOperation({
    summary: "Returns a paginated list of tests from the test bank",
    description: 'Required permissions: "get_tests_bank" or "get_tests_bank_global"',
  })
  @ApiCreatedResponse({
    description: "Returns a paginated list of tests from the test bank",
    type: PaginatedResponseDto(TestWithRelationEntity)
  })
  @ApiBadRequestResponse({
    description: 'Tests cannot be retrieved. Try again!'
  })
  findAll(
    @Query("pageNum") page: string = "1",
    @Query("pageSize") pageSize: string = "10",
    @Query("all") all: string = "false",
    @Query() filters: GetTestsDto
  ) {
    return this.testBankService.findTests(+page, +pageSize, JSON.parse(all), filters);
  }

  @Auth(['get_test_bank', 'get_test_bank_global'])
  @Get(':id')
  @Serialize(TestWithRelationEntity)
  @ApiOperation({
    summary: "Returns a single test by id",
    description: 'Required permissions: "get_test_bank" or "get_test_bank_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a single test',
    type: TestWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Test cannot be retrieved. Try again!'
  })
  findOne(@Param('id') id: string) {
    return this.testBankService.getTestById(id);
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
    return this.testBankService.getTestsByCompany(companyId);
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
    return this.testBankService.getTestsByIds(data.testIds);
  }

  @Auth(['get_tests_from_bank', 'get_tests_from_bank_global'])
  @Get('bank/all')
  @Serialize(TestWithRelationEntity)
  @ApiOperation({
    summary: "Returns all tests from the test bank",
    description: 'Required permissions: "get_tests_from_bank" or "get_tests_from_bank_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns all tests from bank',
    type: [TestWithRelationEntity],
  })
  @ApiBadRequestResponse({
    description: 'Tests cannot be retrieved. Try again!'
  })
  getTestsFromBank() {
    return this.testBankService.getTestsFromBank();
  }

  @Auth(['update_test_bank', 'update_test_bank_global'])
  @Patch(':id')
  @Serialize(TestWithRelationEntity)
  @ApiCreatedResponse({
    description: "Returns updated test",
    type: TestWithRelationEntity,
  })
  @ApiOperation({
    summary: "Updates a test by id and returns it",
    description: 'Required permissions: "update_test_bank" or "update_test_bank_global"',
  })
  @ApiBadRequestResponse({
    description: 'Test cannot be updated. Try again!'
  })
  update(@Param('id') id: string, @Body() data: UpdateTestDto) {
    return this.testBankService.updateTest(id, data);
  }

  @Auth(['delete_test_bank', 'delete_test_bank_global'])
  @Delete(':id')
  @ApiCreatedResponse({
    description: 'Returns deleted test',
    type: TestEntity,
  })
  @ApiOperation({
    summary: 'Deletes a test by id and returns it',
    description: 'Required permissions: "delete_test_bank" or "delete_test_bank_global"',
  })
  @ApiBadRequestResponse({
    description: 'Test cannot be deleted. Try again!'
  })
  remove(@Param('id') id: string) {
    return this.testBankService.deleteTest(id);
  }
}
