import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, InvitationStatus, EmailDeliveryStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../pagination/pagination.service';
import { CreateAssessmentDto } from '@/assessments/dto/create-assessment.dto';
import { CompaniesService } from './companies.service';
import { CreateCompanyAssessmentDto } from './dto/company-assessments.dto';

@Injectable()
export class CompanyAssessmentService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
    private companyService: CompaniesService,
  ) {}

  async getCompanyAssessments(
    companyId: string,
    page: number,
    pageSize: number,
    all?: boolean,
   filters?: {
    search?: string,
    status?: string,
    createdBy?: string,
   }
  ) {
    const include: Prisma.CompanyAssessmentInclude = {
      company: true,
      creator: true,
      antiCheatSettings: true,
      brandingSettings: true,
      invitations: true,
      assessmentTests: true,
      customQuestions: true,
      candidateSessions: true,
    };

    const where: Prisma.CompanyAssessmentWhereInput = {
      company: {
        id: companyId,
      },
      ...(filters?.search && {
        title: {
          contains: filters.search,
          mode: 'insensitive',
        },
      }),
      ...(filters?.status && {
        status: filters.status,
      }),
      ...(filters?.createdBy && {
        creator: {
          id: filters.createdBy,
        },
      }),
    };

    const res = await this.paginationService.paginate('companyAssessment', {
      all,
      page,
      pageSize,
      include,
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res;
  }

  async getCompanyAssessment(companyAssessmentId: string) {
    const companyAssessment = await this.prisma.companyAssessment.findUnique({
      where: { id: companyAssessmentId },
      include: {
        company: true,
        creator: true,
        antiCheatSettings: true,
        brandingSettings: true,
        invitations: true,
        assessmentTests: {
          include: {
            test: true,
             TestConfig: true,
          },
        },
        customQuestions: true,
        candidateSessions: true,
      },
    });

    if (!companyAssessment) {
      throw new NotFoundException('Company assessment not found');
    }

    return companyAssessment;
  }

  async createCompanyAssessment(data: CreateCompanyAssessmentDto) {
    await this.companyService.getCompany(data.ownerCompanyId);

    return await this.prisma.companyAssessment.create({
      data: {
        title: data.title,
        description: data.description,
        ownerCompanyId: data.ownerCompanyId,
        maxTests: data.maxTests,
        maxCustomQuestions: data.maxCustomQuestions,
        customQuestions: {
          create: data.customQuestions.map((question) => ({
            prompt: question.prompt,
            options: question.options,
            correctAnswer: question.correctAnswer,
            type: question.type,
            maxScore: question.maxScore,
            codeLanguage: question.codeLanguage,
            timeLimitSeconds: question.timeLimitSeconds,
            difficulty: question.difficulty,
          })),
        },
        brandingSettings: {
          create: {
            logoUrl: data.brandingSettings.logoUrl,
            themeColorHex: data.brandingSettings.themeColorHex,
            fontFamily: data.brandingSettings.fontFamily,
            welcomeText: data.brandingSettings.welcomeText,
          },
        },
        antiCheatSettings: {
          create: {
            blockCopyPaste: data.antiCheatSettings.blockCopyPaste,
            disableRightClick: data.antiCheatSettings.disableRightClick,
            detectWindowFocus: data.antiCheatSettings.detectWindowFocus,
            detectTabSwitching: data.antiCheatSettings.detectTabSwitching,
            enableFullscreen: data.antiCheatSettings.enableFullscreen,
            preventScreenCapture: data.antiCheatSettings.preventScreenCapture,
            enableScreenRecording: data.antiCheatSettings.enableScreenRecording,
            screenRecordingInterval: data.antiCheatSettings.screenRecordingInterval,
          },
        },
        languageCodes: data.languageCodes || [],
        timeLimitSeconds: data.timeLimitSeconds,
        timeLimitMinutes: data.timeLimitMinutes,
        passMark: data.passMark,
        expiresAt: data.expiresAt,
        createdBy: data.createdBy,
      },
    });
  }

  // Company Assessment Invitations Methods
  async getCompanyAssessmentInvitations(
    companyId: string,
    filters: {
      page: number;
      pageSize: number;
      search?: string;
      status?: string;
      all?: boolean;
    }
  ) {
    const include: Prisma.CandidateInvitationInclude = {
      company: true,
      assessments: true,
    };

    const where: Prisma.CandidateInvitationWhereInput = {
      companyId,
      ...(filters.search && {
        OR: [
          {
            candidateName: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            candidateEmail: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        ],
      }),
      ...(filters.status && {
        status: filters.status as InvitationStatus,
      }),
    };

    return await this.paginationService.paginate('candidateInvitation', {
      all: filters.all,
      page: filters.page,
      pageSize: filters.pageSize,
      include,
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCompanyAssessmentInvitation(invitationId: string) {
    const invitation = await this.prisma.candidateInvitation.findUnique({
      where: { id: invitationId },
      include: {
        company: true,
        assessments: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }

  async createCompanyAssessmentInvitation(data: {
    candidateEmail: string;
    candidateName: string;
    assessmentIds: string[];
    companyId: string;
    invitedBy: string;
    invitedByName: string;
    expiresAt: Date;
    maxAttempts: number;
  }) {
    // Check if company exists
    await this.companyService.getCompany(data.companyId);

    // Generate unique invitation link
    const invitationToken = this.generateInvitationToken();
    const invitationLink = `${process.env.FRONTEND_URL}/assessment/invite/${invitationToken}`;

    try {
      const invitation = await this.prisma.candidateInvitation.create({
        data: {
          candidateEmail: data.candidateEmail,
          candidateName: data.candidateName,
          assessmentIds: data.assessmentIds,
          companyId: data.companyId,
          invitedBy: data.invitedBy,
          invitedByName: data.invitedByName,
          expiresAt: data.expiresAt,
          maxAttempts: data.maxAttempts,
          invitationLink,
          status: InvitationStatus.SENT,
          emailDeliveryStatus: EmailDeliveryStatus.PENDING,
        },
        include: {
          company: true,
          assessments: true,
        },
      });

      return invitation;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Invitation already exists for this candidate and assessment');
        }
      }
      throw error;
    }
  }

  async createBulkCompanyAssessmentInvitations(data: {
    candidates: Array<{
      candidateEmail: string;
      candidateName: string;
    }>;
    assessmentIds: string[];
    companyId: string;
    invitedBy: string;
    invitedByName: string;
    expiresAt: Date;
    maxAttempts: number;
    customMessage?: string;
  }) {
    // Check if company exists
    await this.companyService.getCompany(data.companyId);

    const invitations = [];
    const errors = [];

    try {
      // Use a transaction to ensure all invitations are created or none
      const result = await this.prisma.$transaction(async (prisma) => {
        const createdInvitations = [];

        for (const candidate of data.candidates) {
          try {
            // Generate unique invitation token for each candidate
            const invitationToken = this.generateInvitationToken();
            const invitationLink = `${process.env.FRONTEND_URL}/assessment/invite/${invitationToken}`;

            const invitation = await prisma.candidateInvitation.create({
              data: {
                candidateEmail: candidate.candidateEmail,
                candidateName: candidate.candidateName,
                assessmentIds: data.assessmentIds,
                companyId: data.companyId,
                invitedBy: data.invitedBy,
                invitedByName: data.invitedByName,
                expiresAt: data.expiresAt,
                maxAttempts: data.maxAttempts,
                invitationLink,
                status: InvitationStatus.SENT,
                emailDeliveryStatus: EmailDeliveryStatus.PENDING,
              },
              include: {
                company: true,
                assessments: true,
              },
            });

            createdInvitations.push(invitation);
          } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
              errors.push({
                email: candidate.candidateEmail,
                error: 'Invitation already exists for this candidate and assessment'
              });
            } else {
              errors.push({
                email: candidate.candidateEmail,
                error: 'Failed to create invitation'
              });
            }
          }
        }

        return createdInvitations;
      });

      return {
        successful: result.length,
        failed: errors.length,
        invitations: result,
        errors: errors,
        total: data.candidates.length
      };
    } catch (error) {
      throw error;
    }
  }

  async updateCompanyAssessmentInvitation(
    invitationId: string,
    updateData: {
      status?: string;
      expiresAt?: Date;
      maxAttempts?: number;
      emailDeliveryStatus?: string;
      remindersSent?: number;
      lastReminderSent?: Date;
    }
  ) {
    const invitation = await this.prisma.candidateInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Convert frontend enum values to backend enum values
    const convertedData: any = { ...updateData };
    if (updateData.status) {
      convertedData.status = updateData.status.toUpperCase() as InvitationStatus;
    }
    if (updateData.emailDeliveryStatus) {
      convertedData.emailDeliveryStatus = updateData.emailDeliveryStatus.toUpperCase() as EmailDeliveryStatus;
    }

    return await this.prisma.candidateInvitation.update({
      where: { id: invitationId },
      data: {
        ...convertedData,
        updatedAt: new Date(),
      },
      include: {
        company: true,
        assessments: true,
      },
    });
  }

  async resendCompanyAssessmentInvitation(data: {
    invitationId: string;
    candidateEmail: string;
    candidateName: string;
    assessmentLink: string;
    deadline: string;
    companyName: string;
  }) {
    const invitation = await this.getCompanyAssessmentInvitation(data.invitationId);

    // Update invitation with resend information
    const updatedInvitation = await this.updateCompanyAssessmentInvitation(data.invitationId, {
      emailDeliveryStatus: EmailDeliveryStatus.SENT,
      remindersSent: (invitation.remindersSent || 0) + 1,
      lastReminderSent: new Date(),
    });

    // Here you would integrate with your email service
    // For now, we'll just return the updated invitation
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    
    return updatedInvitation;
  }

  async deleteCompanyAssessmentInvitation(invitationId: string) {
    const invitation = await this.prisma.candidateInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return await this.prisma.candidateInvitation.delete({
      where: { id: invitationId },
    });
  }

  private generateInvitationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }
}
