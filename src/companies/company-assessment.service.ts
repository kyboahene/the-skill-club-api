import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, InvitationStatus, EmailDeliveryStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../pagination/pagination.service';
import { CreateAssessmentDto } from '@/assessments/dto/create-assessment.dto';
import { CompaniesService } from './companies.service';
import { CreateCompanyAssessmentDto } from './dto/company-assessments.dto';
import { UpdateCompanyAssessmentDto } from './dto/update-company-assessment.dto';

@Injectable()
export class CompanyAssessmentService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
    private companyService: CompaniesService,
    private eventEmitter: EventEmitter2,
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
            test: {
              include: {
                questions: true
              }
            },
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

  async createCompanyAssessment(ownerCompanyId: string, creatorId: string, data: CreateCompanyAssessmentDto) {
    await this.companyService.getCompany(ownerCompanyId);

    return await this.prisma.companyAssessment.create({
      data: {
        title: data.title,
        description: data.description,
        ownerCompanyId: data.ownerCompanyId,
        maxTests: data.maxTests,
        maxCustomQuestions: data.maxCustomQuestions,
        ...(data.assessmentTests && data.assessmentTests.length > 0 && {
          assessmentTests: {
            create: data.assessmentTests.map((assessmentTest) => ({
              test: {
                connect: {
                  id: assessmentTest.testId,
                },
              },
              TestConfig: {
                create: {
                  questionLimit: assessmentTest.questionLimit,
                },
              },
            })),
          },
        }),
        ...(data.customQuestions && data.customQuestions.length > 0 && {
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
        }),
        ...(data.brandingSettings && {
          brandingSettings: {
            create: {
              logoUrl: data.brandingSettings.logoUrl,
              themeColorHex: data.brandingSettings.themeColorHex,
              fontFamily: data.brandingSettings.fontFamily,
              welcomeText: data.brandingSettings.welcomeText,
            },
          },
        }),
        ...(data.antiCheatSettings && {
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
        }),
        languageCodes: data.languageCodes || [],
        timeLimitSeconds: data.timeLimitSeconds || data.timeLimitMinutes *  60,
        timeLimitMinutes: data.timeLimitMinutes,
        passMark: data.passMark,
        expiresAt: data.expiresAt,
        createdBy: creatorId,
      },
    });
  }

  async updateCompanyAssessment(assessmentId: string, data: UpdateCompanyAssessmentDto) {
    // Verify the assessment exists and belongs to the company
    const existingAssessment = await this.prisma.companyAssessment.findUnique({
      where: {
        id: assessmentId,
      },
    });

    if (!existingAssessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found for this company`);
    }

    // Delete existing related records
    await this.prisma.assessmentTest.deleteMany({
      where: { assessmentId },
    });
    await this.prisma.question.deleteMany({
      where: { assessmentId },
    });

    // Update the assessment with new data
    return await this.prisma.companyAssessment.update({
      where: { id: assessmentId },
      data: {
        title: data.title,
        description: data.description,
        maxTests: data.maxTests,
        maxCustomQuestions: data.maxCustomQuestions,
        ...(data.assessmentTests && data.assessmentTests.length > 0 && {
          assessmentTests: {
            create: data.assessmentTests.map((assessmentTest) => ({
              test: {
                connect: {
                  id: assessmentTest.testId,
                },
              },
              TestConfig: {
                create: {
                  questionLimit: assessmentTest.questionLimit,
                },
              },
            })),
          },
        }),
        ...(data.customQuestions && data.customQuestions.length > 0 && {
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
        }),
        ...(data.brandingSettings && {
          brandingSettings: {
            upsert: {
              create: {
                logoUrl: data.brandingSettings.logoUrl,
                themeColorHex: data.brandingSettings.themeColorHex,
                fontFamily: data.brandingSettings.fontFamily,
                welcomeText: data.brandingSettings.welcomeText,
              },
              update: {
                logoUrl: data.brandingSettings.logoUrl,
                themeColorHex: data.brandingSettings.themeColorHex,
                fontFamily: data.brandingSettings.fontFamily,
                welcomeText: data.brandingSettings.welcomeText,
              },
            },
          },
        }),
        ...(data.antiCheatSettings && {
          antiCheatSettings: {
            upsert: {
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
              update: {
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
          },
        }),
        languageCodes: data.languageCodes || [],
        timeLimitSeconds: data.timeLimitSeconds,
        timeLimitMinutes: data.timeLimitMinutes,
        passMark: data.passMark,
        expiresAt: data.expiresAt,
      },
      include: {
        company: true,
        creator: true,
        antiCheatSettings: true,
        brandingSettings: true,
        assessmentTests: {
          include: {
            test: true,
            TestConfig: true,
          },
        },
        customQuestions: true,
      },
    });
  }

  async deleteCompanyAssessment(assessmentId: string) {
    const assessment = await this.prisma.companyAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        candidateSessions: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    // Check if there are any candidate sessions
    if (assessment.candidateSessions && assessment.candidateSessions.length > 0) {
      throw new ConflictException(
        `Cannot delete assessment with existing candidate sessions. Please archive it instead.`
      );
    }

    // Delete the assessment (cascade will handle related records)
    await this.prisma.companyAssessment.delete({
      where: { id: assessmentId },
    });

    return { message: 'Assessment deleted successfully', id: assessmentId };
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
    // Check if company exists and get company data
    const company = await this.companyService.getCompany(data.companyId);

    // Check for existing active invitation with the same candidate email and assessment IDs
    const hasExistingInvitation = await this.checkExistingInvitation(
      data.candidateEmail,
      data.companyId,
      data.assessmentIds
    );

    if (hasExistingInvitation) {
      throw new ConflictException(
        `An active invitation already exists for ${data.candidateEmail}. Please wait for it to expire or complete before sending a new one.`
      );
    }

    // Generate unique invitation link with company name
    const invitationToken = this.generateInvitationToken();
    const companySlug = this.generateCompanySlug(company.name);
    const invitationLink = `${process.env.FRONTEND_URL}/${companySlug}/assessment/invite/${invitationToken}`;

    try {
      const invitation = await this.prisma.candidateInvitation.create({
        data: {
          candidateEmail: data.candidateEmail,
          candidateName: data.candidateName,
          assessments: {
            connect: data.assessmentIds.map((id) => ({ id })),
          },
          companyId: data.companyId,
          invitedBy: data.invitedBy,
          invitedByName: data.invitedByName,
          expiresAt: data.expiresAt,
          maxAttempts: data.maxAttempts,
          invitationLink,
          invitationToken,
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

      console.error("Error creating company assessment invitation:", error);
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
    // Check if company exists and get company data
    const company = await this.companyService.getCompany(data.companyId);
    const companySlug = this.generateCompanySlug(company.name);

    const invitations = [];
    const errors = [];

    try {
      // Use a transaction to ensure all invitations are created or none
      const result = await this.prisma.$transaction(async (prisma) => {
        const createdInvitations = [];

        for (const candidate of data.candidates) {
          try {
            // Check for existing active invitation
            const hasExistingInvitation = await this.checkExistingInvitation(
              candidate.candidateEmail,
              data.companyId,
              data.assessmentIds,
              prisma
            );

            if (hasExistingInvitation) {
              errors.push({
                email: candidate.candidateEmail,
                error: 'An active invitation already exists for this candidate'
              });
              continue; // Skip this candidate
            }

            // Generate unique invitation token for each candidate
            const invitationToken = this.generateInvitationToken();
            const invitationLink = `${process.env.FRONTEND_URL}/${companySlug}/assessment/take/${invitationToken}`;

            const invitation = await prisma.candidateInvitation.create({
              data: {
                candidateEmail: candidate.candidateEmail,
                candidateName: candidate.candidateName,
                assessments: {
                  connect: data.assessmentIds.map((id) => ({ id })),
                },
                companyId: data.companyId,
                invitedBy: data.invitedBy,
                invitedByName: data.invitedByName,
                expiresAt: data.expiresAt,
                maxAttempts: data.maxAttempts,
                invitationLink,
                invitationToken,
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

            console.error("Error creating company assessment invitation:", error);
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

      // Emit events to send invitation emails asynchronously
      for (const invitation of result) {
        try {
          // Extract assessment titles for the email
          const assessmentTitles = invitation.assessments?.map(a => a.title) || [];
          
          // Format deadline if available
          const deadline = data.expiresAt 
            ? new Date(data.expiresAt).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : undefined;

          // Emit event for background email sending
          this.eventEmitter.emit('assessment.invitation', {
            to: invitation.candidateEmail,
            candidateEmail: invitation.candidateEmail,
            candidateName: invitation.candidateName,
            companyName: invitation.company?.name || 'Company',
            invitationLink: invitation.invitationLink,
            assessmentTitles,
            deadline,
            maxAttempts: data.maxAttempts,
            customMessage: data.customMessage,
            subject: `Assessment Invitation from ${invitation.company?.name || 'Company'}`,
            template: 'assessment-invitation',
            name: invitation.candidateName,
          });

          // Update email delivery status to SENT after emitting event
          await this.prisma.candidateInvitation.update({
            where: { id: invitation.id },
            data: { emailDeliveryStatus: EmailDeliveryStatus.SENT }
          });
        } catch (emailError) {
          // Log error but don't fail the entire operation
          console.error(`Failed to send email for invitation ${invitation.id}:`, emailError);
          
          // Update email delivery status to FAILED
          await this.prisma.candidateInvitation.update({
            where: { id: invitation.id },
            data: { emailDeliveryStatus: EmailDeliveryStatus.FAILED }
          });
        }
      }

      return {
        successful: result.length,
        failed: errors.length,
        invitations: result,
        errors: errors,
        total: data.candidates.length
      };
    } catch (error) {
      console.error("Error creating bulk company assessment invitations:", error);
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

    try {
      // Extract assessment titles for the email
      const assessmentTitles = invitation.assessments?.map(a => a.title) || [];

      // Emit event for background email sending (resend)
      this.eventEmitter.emit('assessment.invitation', {
        to: data.candidateEmail,
        candidateEmail: data.candidateEmail,
        candidateName: data.candidateName,
        companyName: data.companyName,
        invitationLink: data.assessmentLink,
        assessmentTitles,
        deadline: data.deadline,
        maxAttempts: invitation.maxAttempts,
        subject: `Reminder: Assessment Invitation from ${data.companyName}`,
        template: 'assessment-invitation',
        name: data.candidateName,
      });

      // Update invitation with resend information
      const updatedInvitation = await this.updateCompanyAssessmentInvitation(data.invitationId, {
        emailDeliveryStatus: EmailDeliveryStatus.SENT,
        remindersSent: (invitation.remindersSent || 0) + 1,
        lastReminderSent: new Date(),
      });

      return updatedInvitation;
    } catch (error) {
      // Update email delivery status to FAILED
      await this.updateCompanyAssessmentInvitation(data.invitationId, {
        emailDeliveryStatus: EmailDeliveryStatus.FAILED,
      });
      throw error;
    }
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

  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.candidateInvitation.findUnique({
      where: { invitationToken: token },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        assessments: {
          include: {
            antiCheatSettings: true,
            customQuestions:  {
              include: {
                test:  {
                  include: {
                    questions: true,
                  }
                },
              }
            },
            assessmentTests: {
              include: {
                test:  {
                  include: {
                    questions: true,
                  }
                },
                TestConfig: true,
              }
            },
            brandingSettings: true,
            company: true,
            creator: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or has expired');
    }

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('This invitation has expired');
    }

    // Check if invitation status is valid
    if (invitation.status === InvitationStatus.COMPLETED) {
      throw new BadRequestException('This assessment has already been completed');
    }

    if (invitation.status === InvitationStatus.CANCELLED) {
      throw new BadRequestException('This invitation has been cancelled');
    }

    // Check if max attempts reached
    if (invitation.attemptCount >= invitation.maxAttempts) {
      throw new BadRequestException('Maximum attempts reached for this assessment');
    }

    // Update status to OPENED if it's the first time
    if (invitation.status === InvitationStatus.SENT && !invitation.openedAt) {
      await this.prisma.candidateInvitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.OPENED,
          openedAt: new Date(),
        },
      });
    }

    return invitation;
  }

  private async checkExistingInvitation(
    candidateEmail: string,
    companyId: string,
    assessmentIds: string[],
    prisma: any = this.prisma
  ): Promise<boolean> {
    const existingInvitation = await prisma.candidateInvitation.findFirst({
      where: {
        candidateEmail,
        companyId,
        assessments: {
          some: {
            id: {
              in: assessmentIds,
            },
          },
        },
        status: {
          in: [InvitationStatus.SENT, InvitationStatus.OPENED, InvitationStatus.STARTED],
        },
        expiresAt: {
          gte: new Date(), // Not expired yet
        },
      },
    });

    return !!existingInvitation;
  }

  private generateCompanySlug(companyName: string): string {
    return companyName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') 
      .replace(/[\s_]+/g, '-')  
      .replace(/^-+|-+$/g, '');  
  }

  private generateInvitationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }
}
