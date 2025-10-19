import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  SetMetadata,
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
import { CandidateSessionsService } from '../candidate-sessions/candidate-sessions.service';
import { CreateCompanyAssessmentDto } from './dto/company-assessments.dto';
import { UpdateCompanyAssessmentDto } from './dto/update-company-assessment.dto';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { UserWithRelationsEntity } from '@/users/entities/user-with-relations.entity';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('Companies')
@Controller('companies')
@ApiBearerAuth()
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly companyAssessmentService: CompanyAssessmentService,
    private readonly candidateSessionsService: CandidateSessionsService,
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

  @Auth(['get_company_assessment', 'get_company_assessment_global'])
  @Get('/assessments/:id')
  @ApiOperation({
    summary: 'Retrieves a company assessment by id',
    description:
      'Required permissions: "get_company_assessment" or "get_company_assessment_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a company assessment by id',
  })
  @ApiBadRequestResponse({
    description: 'Company assessment cannot be retrieved. Try again!',
  })
  async getCompanyAssessment(
      @Param('id') companyAssessmentId: string,
  ) {
    return this.companyAssessmentService.getCompanyAssessment(
      companyAssessmentId,
    );
  }

  // @Auth(['add_company_assessment', 'add_company_assessment_global'])
  @Auth(['get_company_assessment', 'get_company_assessment_global'])
  @Post('assessments')
  @ApiOperation({
    summary: 'Creates and returns created company assessment',
    description:
      'Required permissions: "add_company_assessment" or "add_company_assessment_global"',
  })
  @ApiCreatedResponse({
    description: 'Created company assessment object as response',
  })
  @ApiBadRequestResponse({
    description: 'Company assessment cannot be created. Try again!',
  })
  async createCompanyAssessment(
    @GetUser("") user: UserWithRelationsEntity,
    @Body() createCompanyAssessmentDto: CreateCompanyAssessmentDto,
  ) {
    return this.companyAssessmentService.createCompanyAssessment(
      user.company.id,
      user.id,
      createCompanyAssessmentDto,
    );
  }

  @Auth(['update_company_assessment', 'update_company_assessment_global'])
  @Patch('assessments/:id')
  @ApiOperation({
    summary: 'Updates and returns updated company assessment',
    description:
      'Required permissions: "update_company_assessment" or "update_company_assessment_global"',
  })
  @ApiCreatedResponse({
    description: 'Updated company assessment object as response',
  })
  @ApiBadRequestResponse({
    description: 'Company assessment cannot be updated. Try again!',
  })
  async updateCompanyAssessment(
    @Param('id') assessmentId: string,
    @Body() updateCompanyAssessmentDto: UpdateCompanyAssessmentDto,
  ) {
    return this.companyAssessmentService.updateCompanyAssessment(
      assessmentId,
      updateCompanyAssessmentDto,
    );
  }

  @Auth(['delete_company_assessment', 'delete_company_assessment_global'])
  @Delete('assessments/:id')
  @ApiOperation({
    summary: 'Deletes a company assessment by id',
    description:
      'Required permissions: "delete_company_assessment" or "delete_company_assessment_global"',
  })
  @ApiCreatedResponse({
    description: 'Company assessment deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Company assessment cannot be deleted. Try again!',
  })
  async deleteCompanyAssessment(@Param('id') assessmentId: string) {
    return this.companyAssessmentService.deleteCompanyAssessment(assessmentId);
  }

  @Auth(['update_company', 'update_company_global'])
  @Patch(':id')
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
  @Patch('users/:userId')
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

  // Assessment Invitations Endpoints
  @Auth(['get_company_assessment_invitations', 'get_company_assessment_invitations_global'])
  @Get('/:companyId/assessments/invitations')
  @ApiOperation({
    summary: 'Retrieves a paginated list of company assessment invitations',
    description: 'Required permissions: "get_company_assessment_invitations" or "get_company_assessment_invitations_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a paginated list of assessment invitations',
  })
  @ApiBadRequestResponse({
    description: 'Assessment invitations cannot be retrieved. Try again!',
  })
  async getCompanyAssessmentInvitations(
    @Param("companyId") companyId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('all') all: string = 'false',
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.companyAssessmentService.getCompanyAssessmentInvitations(
      companyId,
      {
        page: +page,
        pageSize: +pageSize,
        all: JSON.parse(all),
        search,
        status,
      }
    );
  }

  @Auth(['get_company_assessment_invitation', 'get_company_assessment_invitation_global'])
  @Get('assessments/invitations/:invitationId')
  @ApiOperation({
    summary: 'Retrieves a single assessment invitation',
    description: 'Required permissions: "get_company_assessment_invitation" or "get_company_assessment_invitation_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a single assessment invitation',
  })
  @ApiBadRequestResponse({
    description: 'Assessment invitation cannot be retrieved. Try again!',
  })
  async getCompanyAssessmentInvitation(@Param('invitationId') invitationId: string) {
    return this.companyAssessmentService.getCompanyAssessmentInvitation(invitationId);
  }

  @Auth(['update_company_assessment_invitation', 'update_company_assessment_invitation_global'])
  @Patch('assessments/invitations/:invitationId')
  @ApiOperation({
    summary: 'Updates an assessment invitation',
    description: 'Required permissions: "update_company_assessment_invitation" or "update_company_assessment_invitation_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns updated assessment invitation',
  })
  @ApiBadRequestResponse({
    description: 'Assessment invitation cannot be updated. Try again!',
  })
  async updateCompanyAssessmentInvitation(
    @Param('invitationId') invitationId: string,
    @Body() updateData: any
  ) {
    return this.companyAssessmentService.updateCompanyAssessmentInvitation(invitationId, updateData);
  }

  @Auth(['resend_company_assessment_invitation', 'resend_company_assessment_invitation_global'])
  @Post('assessments/invitations/:invitationId/resend')
  @ApiOperation({
    summary: 'Resends an assessment invitation',
    description: 'Required permissions: "resend_company_assessment_invitation" or "resend_company_assessment_invitation_global"',
  })
  @ApiCreatedResponse({
    description: 'Assessment invitation resent successfully',
  })
  @ApiBadRequestResponse({
    description: 'Assessment invitation cannot be resent. Try again!',
  })
  async resendCompanyAssessmentInvitation(
    @Param('invitationId') invitationId: string,
    @Body() resendData: any
  ) {
    return this.companyAssessmentService.resendCompanyAssessmentInvitation({
      invitationId,
      ...resendData
    });
  }

  @Auth(['delete_company_assessment_invitation', 'delete_company_assessment_invitation_global'])
  @Delete('assessments/invitations/:invitationId')
  @ApiOperation({
    summary: 'Deletes an assessment invitation',
    description: 'Required permissions: "delete_company_assessment_invitation" or "delete_company_assessment_invitation_global"',
  })
  @ApiCreatedResponse({
    description: 'Assessment invitation deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Assessment invitation cannot be deleted. Try again!',
  })
  async deleteCompanyAssessmentInvitation(@Param('invitationId') invitationId: string) {
    return this.companyAssessmentService.deleteCompanyAssessmentInvitation(invitationId);
  }

  @Auth(['create_company_assessment_invitations', 'create_company_assessment_invitations_global'])
  @Post('assessment-invitations')
  @ApiOperation({
    summary: 'Create single assessment invitation',
    description: 'Required permissions: "create_company_assessment_invitations" or "create_company_assessment_invitations_global"',
  })
  @ApiCreatedResponse({
    description: 'Invitation created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invitation cannot be created. Try again!',
  })
  async createCompanyAssessmentInvitation(
    @Body() createInvitationDto: {
      candidateEmail: string;
      candidateName: string;
      assessmentId: string;
      expiresAt: Date;
      maxAttempts: number;
      sendReminders?: boolean;
      customMessage?: string;
    },
    @Query('companyId') companyId: string,
  ) {
    return this.companyAssessmentService.createCompanyAssessmentInvitation({
      candidateEmail: createInvitationDto.candidateEmail,
      candidateName: createInvitationDto.candidateName,
      assessmentIds: [createInvitationDto.assessmentId],
      companyId,
      invitedBy: 'current-user-id', // TODO: Get from auth context
      invitedByName: 'Current User', // TODO: Get from auth context
      expiresAt: createInvitationDto.expiresAt,
      maxAttempts: createInvitationDto.maxAttempts,
    });
  }

  @Auth(['create_company_assessment_invitations', 'create_company_assessment_invitations_global'])
  @Post('assessment-invitations/bulk')
  @ApiOperation({
    summary: 'Create bulk assessment invitations',
    description: 'Required permissions: "create_company_assessment_invitations" or "create_company_assessment_invitations_global"',
  })
  @ApiCreatedResponse({
    description: 'Bulk invitations created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Bulk invitations cannot be created. Try again!',
  })
  async createBulkCompanyAssessmentInvitations(
    @Body() createBulkInvitationDto: {
      candidates: Array<{
        candidateEmail: string;
        candidateName: string;
      }>;
      assessmentIds: string[];
      expiresAt: Date;
      maxAttempts: number;
      customMessage?: string;
    },
    @GetUser("") user: UserWithRelationsEntity,
  ) {
    return this.companyAssessmentService.createBulkCompanyAssessmentInvitations({
      ...createBulkInvitationDto,
      companyId: user.company.id,
      invitedBy: user.id,
      invitedByName: user.name,
    });
  }

  // Candidate Sessions Endpoints
  @Auth(['get_company_candidate_sessions', 'get_company_candidate_sessions_global'])
  @Get('candidate-sessions')
  @ApiOperation({
    summary: 'Retrieves aggregated candidate sessions for a company',
    description: 'Required permissions: "get_company_candidate_sessions" or "get_company_candidate_sessions_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns aggregated candidate sessions data',
  })
  @ApiBadRequestResponse({
    description: 'Candidate sessions cannot be retrieved. Try again!',
  })
  async getCompanyCandidateSessions(
    @GetUser("") user: UserWithRelationsEntity,
    @Query('companyId') companyId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('all') all: string = 'false',
    @Query('search') search?: string,
  ) {
    return this.candidateSessionsService.getAssessmentCandidateSessions({
      companyId: companyId || user.company.id,
      page: +page,
      pageSize: +pageSize,
      all: JSON.parse(all),
      search,
    });
  }

  @Public()
  @Get('invitations/token/:token')
  @ApiOperation({
    summary: 'Get invitation details by token (Public endpoint for candidates)',
    description: 'Allows candidates to retrieve their invitation details using the unique token from the invitation link. This endpoint is not protected by authentication.',
  })
  @ApiCreatedResponse({
    description: 'Returns invitation details with company and assessment information',
  })
  @ApiBadRequestResponse({
    description: 'Invitation not found, expired, or invalid',
  })
  async getInvitationByToken(@Param('token') token: string) {
    return this.companyAssessmentService.getInvitationByToken(token);
  }
}
