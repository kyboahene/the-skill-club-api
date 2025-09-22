import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Auth } from '@/auth/decorator';

import { CompaniesService } from './companies.service';

import { CompanyEntity } from './entities/company.entity';
import { CompanyWithRelationEntity } from './entities';

import { Serialize } from '@/shared/interceptors/serializer.interceptor';
import { PaginatedResponseDto } from '@/pagination/pagination.entity';

import {
  CreateCompanyDto,
  UpdateCompanyDto,
  GetCompaniesDto,
  CreateCompanyWithOwnerDto,
  AddCompanyUserDto,
  UpdateCompanyUserDto,
} from './dto';
import { CompanyAssessmentService } from './company-assessment.service';

@ApiTags('Companies')
@Controller('companies')
@ApiBearerAuth()
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly companyAssessmentService: CompanyAssessmentService,
  ) {}

  @Auth(['get_companies', 'get_companies_global'])
  @Get()
  @Serialize(PaginatedResponseDto(CompanyWithRelationEntity))
  @ApiOperation({
    summary: 'Returns a paginated list of companies',
    description:
      'Required permissions: "get_companies" or "get_companies_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a paginated list of companies',
    type: PaginatedResponseDto(CompanyWithRelationEntity),
  })
  @ApiBadRequestResponse({
    description: 'Companies cannot be retrieved. Try again!',
  })
  async findCompanies(
    @Query('pageNum') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('all') all: string = 'false',
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('companySize') companySize?: string,
    @Query('market') market?: string,
    @Query('country') country?: string,
  ) {
    return this.companiesService.findCompanies(
      +page,
      +pageSize,
      JSON.parse(all),
      {
        search,
        type,
        companySize,
        market,
        country,
      },
    );
  }

  @Auth(['get_company', 'get_company_global'])
  @Get(':id')
  @ApiOperation({
    summary: 'Returns a single company by id',
    description: 'Required permissions: "get_company" or "get_company_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a single company with full details',
    type: CompanyWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Company cannot be retrieved. Try again!',
  })
  async findOne(@Param('id') id: string) {
    return this.companiesService.getCompany(id);
  }

  @Auth(['add_company', 'add_company_global'])
  @Post()
  @ApiOperation({
    summary: 'Creates and returns created company',
    description: 'Required permissions: "add_company" or "add_company_global"',
  })
  @ApiCreatedResponse({
    description: 'Created company object as response',
    type: CompanyWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Company cannot be created. Try again!',
  })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.createCompany(createCompanyDto);
  }


  @Auth(['get_company_assessments', 'get_company_assessments_global'])
  @Get('/:id/assessments')
  @ApiOperation({
    summary: 'Retrieves a paginated list of company assessments',
    description:
      'Required permissions: "get_company_assessments" or "get_company_assessments_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a paginated list of company assessments',
  })
  @ApiBadRequestResponse({
    description: 'Company assessments cannot be retrieved. Try again!',
  })
  async getCompanyAssessments(
    @Param('id') companyId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('all') all: string = 'false',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('createdBy') createdBy?: string,
  ) {
    return this.companyAssessmentService.getCompanyAssessments(
      companyId,
      +page,
      +pageSize,
      JSON.parse(all),
      {
        search,
        status,
        createdBy,
      },
    );
  }

  @Auth(['update_company', 'update_company_global'])
  @Put(':id')
  @ApiOperation({
    summary: 'Updates a company by id and returns it',
    description:
      'Required permissions: "update_company" or "update_company_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns updated company',
    type: CompanyWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Company cannot be updated. Try again!',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.updateCompany(id, updateCompanyDto);
  }

  @Auth(['update_company_user', 'update_company_user_global'])
  @Put('users/:userId')
  @ApiOperation({
    summary: 'Updates a company user by user id',
    description:
      'Required permissions: "update_company_user" or "update_company_user_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns updated company user',
  })
  @ApiBadRequestResponse({
    description: 'Company user cannot be updated. Try again!',
  })
  async updateCompanyUser(
    @Param('userId') userId: string,
    @Body() updateCompanyUserDto: UpdateCompanyUserDto,
  ) {
    return this.companiesService.updateCompanyUser(
      userId,
      updateCompanyUserDto,
    );
  }

  @Auth(['delete_company_user', 'delete_company_user_global'])
  @Delete('users/:userId')
  @ApiOperation({
    summary: 'Removes a user from a company',
    description:
      'Required permissions: "delete_company_user" or "delete_company_user_global"',
  })
  @ApiCreatedResponse({
    description: 'Company user removed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Company user cannot be removed. Try again!',
  })
  async removeCompanyUser(@Param('userId') userId: string) {
    return this.companiesService.removeCompanyUser(userId);
  }
}
