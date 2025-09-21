import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiBadRequestResponse, ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

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

@ApiTags('Companies')
@Controller('companies')
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Auth(['get_companies', 'get_companies_global'])
  @Get()
  @Serialize(PaginatedResponseDto(CompanyWithRelationEntity))
  @ApiOperation({
    summary: "Returns a paginated list of companies",
    description: 'Required permissions: "get_companies" or "get_companies_global"',
  })
  @ApiCreatedResponse({
    description: "Returns a paginated list of companies",
    type: PaginatedResponseDto(CompanyWithRelationEntity)
  })
  @ApiBadRequestResponse({
    description: 'Companies cannot be retrieved. Try again!'
  })
  async findAll(
    @Query("pageNum") page: string = "1",
    @Query("pageSize") pageSize: string = "10",
    @Query("all") all: string = "false",
    @Query("search") search?: string,
    @Query("type") type?: string,
    @Query("companySize") companySize?: string,
    @Query("market") market?: string,
    @Query("country") country?: string,
  ) {
    return this.companiesService.findCompanies(+page, +pageSize, JSON.parse(all), {
      search,
      type,
      companySize,
      market,
      country,
    });
  }

  @Auth(['get_company', 'get_company_global'])
  @Get(':id')
  @ApiOperation({
    summary: "Returns a single company by id",
    description: 'Required permissions: "get_company" or "get_company_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a single company with full details',
    type: CompanyWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Company cannot be retrieved. Try again!'
  })
  async findOne(@Param('id') id: string) {
    return this.companiesService.getCompany(id);
  }

  @Auth(['get_company_users', 'get_company_users_global'])
  @Get(':id/users')
  @ApiOperation({
    summary: "Returns users for a specific company",
    description: 'Required permissions: "get_company_users" or "get_company_users_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns company users with details',
  })
  @ApiBadRequestResponse({
    description: 'Company users cannot be retrieved. Try again!'
  })
  async getCompanyUsers(@Param('id') companyId: string) {
    return this.companiesService.getCompanyUsers(companyId);
  }


  @Auth(['add_company', 'add_company_global'])
  @Post()
  @ApiOperation({
    summary: "Creates and returns created company",
    description: 'Required permissions: "add_company" or "add_company_global"',
  })
  @ApiCreatedResponse({
    description: "Created company object as response",
    type: CompanyWithRelationEntity
  })
  @ApiBadRequestResponse({
    description: 'Company cannot be created. Try again!'
  })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.createCompany(createCompanyDto);
  }

  @Auth(['add_company_with_owner', 'add_company_with_owner_global'])
  @Post('with-owner')
  @ApiOperation({
    summary: "Creates a company with an owner user",
    description: 'Required permissions: "add_company_with_owner" or "add_company_with_owner_global"',
  })
  @ApiCreatedResponse({
    description: "Created company with owner",
    type: CompanyWithRelationEntity
  })
  @ApiBadRequestResponse({
    description: 'Company with owner cannot be created. Try again!'
  })
  async createCompanyWithOwner(@Body() createCompanyWithOwnerDto: CreateCompanyWithOwnerDto) {
    return this.companiesService.createCompanyWithOwner(createCompanyWithOwnerDto);
  }

  @Auth(['add_company_user', 'add_company_user_global'])
  @Post(':id/users')
  @ApiOperation({
    summary: "Adds a user to a company",
    description: 'Required permissions: "add_company_user" or "add_company_user_global"',
  })
  @ApiCreatedResponse({
    description: "User added to company successfully",
  })
  @ApiBadRequestResponse({
    description: 'User cannot be added to company. Try again!'
  })
  async addUserToCompany(@Body() addCompanyUserDto: AddCompanyUserDto) {
    return this.companiesService.addUserToCompany(addCompanyUserDto);
  }

  @Auth(['update_company', 'update_company_global'])
  @Put(':id')
  @ApiOperation({
    summary: "Updates a company by id and returns it",
    description: 'Required permissions: "update_company" or "update_company_global"',
  })
  @ApiCreatedResponse({
    description: "Returns updated company",
    type: CompanyWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Company cannot be updated. Try again!'
  })
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.updateCompany(id, updateCompanyDto);
  }

  @Auth(['update_company_user', 'update_company_user_global'])
  @Put('users/:userId')
  @ApiOperation({
    summary: "Updates a company user by user id",
    description: 'Required permissions: "update_company_user" or "update_company_user_global"',
  })
  @ApiCreatedResponse({
    description: "Returns updated company user",
  })
  @ApiBadRequestResponse({
    description: 'Company user cannot be updated. Try again!'
  })
  async updateCompanyUser(
    @Param('userId') userId: string,
    @Body() updateCompanyUserDto: UpdateCompanyUserDto,
  ) {
    return this.companiesService.updateCompanyUser(userId, updateCompanyUserDto);
  }

  @Auth(['delete_company_user', 'delete_company_user_global'])
  @Delete('users/:userId')
  @ApiOperation({
    summary: 'Removes a user from a company',
    description: 'Required permissions: "delete_company_user" or "delete_company_user_global"',
  })
  @ApiCreatedResponse({
    description: 'Company user removed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Company user cannot be removed. Try again!'
  })
  async removeCompanyUser(@Param('userId') userId: string) {
    return this.companiesService.removeCompanyUser(userId);
  }
}
