import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CandidateManagementService } from './candidate-management.service';
import {
  CreateInvitationDto,
  GetInvitationsDto,
  CreateEmailTemplateDto,
} from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Controller('candidate-management')
export class CandidateManagementController {
  constructor(private readonly candidateManagementService: CandidateManagementService) {}

  @Get('invitations')
  async getInvitations(@Query() query: GetInvitationsDto) {
    return this.candidateManagementService.getInvitations(query);
  }

  @Get('invitations/:id')
  async getInvitation(@Param('id') id: string) {
    return this.candidateManagementService.getInvitation(id);
  }

  @Get('companies/:companyId/invitations')
  async getCompanyInvitations(
    @Param('companyId') companyId: string,
    @Query() query: GetInvitationsDto,
  ) {
    return this.candidateManagementService.getCompanyInvitations(companyId, query);
  }

  @Get('companies/:companyId/email-templates')
  async getEmailTemplates(@Param('companyId') companyId: string) {
    return this.candidateManagementService.getEmailTemplates(companyId);
  }

  @Post('invitations')
  @HttpCode(HttpStatus.CREATED)
  async createInvitation(@Body() createInvitationDto: CreateInvitationDto) {
    return this.candidateManagementService.createInvitation(createInvitationDto);
  }

  @Post('invitations/check-existing')
  @HttpCode(HttpStatus.OK)
  async checkExistingInvitations(
    @Body() body: { candidateEmail: string; assessmentIds: string[]; companyId: string },
  ) {
    return this.candidateManagementService.checkExistingInvitations(
      body.candidateEmail,
      body.assessmentIds,
      body.companyId,
    );
  }

  @Post('email-templates')
  @HttpCode(HttpStatus.CREATED)
  async createEmailTemplate(@Body() createEmailTemplateDto: CreateEmailTemplateDto) {
    return this.candidateManagementService.createEmailTemplate(createEmailTemplateDto);
  }

  @Put('invitations')
  async updateInvitation(@Body() updateInvitationDto: UpdateInvitationDto) {
    return this.candidateManagementService.updateInvitation(updateInvitationDto);
  }

  @Put('invitations/expire-old')
  @HttpCode(HttpStatus.OK)
  async expireOldInvitations() {
    return this.candidateManagementService.expireOldInvitations();
  }
}
