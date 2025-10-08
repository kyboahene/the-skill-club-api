import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInvitationDto,
  GetInvitationsDto,
  CreateEmailTemplateDto,
} from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { EmailDeliveryStatus, InvitationStatus } from '@prisma/client';

@Injectable()
export class CandidateManagementService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate URL-safe slug from company name
   */
  private generateCompanySlug(companyName: string): string {
    return companyName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_]+/g, '-')   // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
  }

  private generateInvitationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }

  async getInvitations(query: GetInvitationsDto) {
    const { limit = 10, companyId, status, search } = query;
    
    const where: any = {};
    
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    
    if (search) {
      where.OR = [
        {
          candidateName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          candidateEmail: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const invitations = await this.prisma.candidateInvitation.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        company: true,
        inviter: true,
      },
    });

    return {
      invitations,
      count: invitations.length,
    };
  }

  async getInvitation(id: string) {
    const invitation = await this.prisma.candidateInvitation.findUnique({
      where: { id },
      include: {
        company: true,
        inviter: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    }

    return invitation;
  }

  async getCompanyInvitations(companyId: string, query: GetInvitationsDto) {
    const { limit = 10, status, search } = query;
    
    const where: any = { companyId };
    
    if (status) where.status = status;
    
    if (search) {
      where.OR = [
        {
          candidateName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          candidateEmail: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const invitations = await this.prisma.candidateInvitation.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        company: true,
        inviter: true,
      },
    });

    const hasNextPage = invitations.length === limit;

    return {
      invitations,
      hasNextPage,
      count: invitations.length,
    };
  }

  async checkExistingInvitations(candidateEmail: string, assessmentIds: string[], companyId: string) {
    const existingInvitations = await this.prisma.candidateInvitation.findMany({
      where: {
        candidateEmail,
        companyId,
        status: {
          in: ['SENT', 'OPENED', 'STARTED'],
        },
        assessmentIds: {
          hasSome: assessmentIds,
        },
      },
      include: {
        company: true,
      },
    });

    return existingInvitations;
  }

  async createInvitation(createInvitationDto: CreateInvitationDto) {
    const {
      candidateEmails,
      candidateNames,
      assessmentIds,
      companyId,
      invitedBy,
      invitedByName,
      expiresAt,
      maxAttempts = 3,
    } = createInvitationDto;

    // Verify company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Verify inviter exists
    const inviter = await this.prisma.user.findUnique({
      where: { id: invitedBy },
    });

    if (!inviter) {
      throw new NotFoundException(`User with ID ${invitedBy} not found`);
    }

    // Verify assessments exist
    const assessments = await this.prisma.talentAssessment.findMany({
      where: {
        id: {
          in: assessmentIds,
        },
      },
    });

    if (assessments.length !== assessmentIds.length) {
      throw new NotFoundException('One or more assessments not found');
    }

    const invitationIds: string[] = [];
    const createdInvitations = [];

    for (let i = 0; i < candidateEmails.length; i++) {
      const email = candidateEmails[i];
      const name = candidateNames?.[i] || email;

      // Check for existing active invitations
      const existingInvitations = await this.checkExistingInvitations(email, assessmentIds, companyId);
      
      if (existingInvitations.length > 0) {
        throw new ConflictException(
          `Active invitation already exists for ${email} with overlapping assessments`
        );
      }

      const expirationDate = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Generate unique invitation token
      const invitationToken = this.generateInvitationToken();
      const companySlug = this.generateCompanySlug(company.name);
      const invitationLink = `${process.env.APP_URL}/${companySlug}/assessment/invite/${invitationToken}`;

      const invitation = await this.prisma.candidateInvitation.create({
        data: {
          candidateEmail: email,
          candidateName: name,
          assessmentIds,
          companyId,
          invitedBy,
          invitedByName,
          status: 'SENT',
          sentAt: new Date(),
          expiresAt: expirationDate,
          maxAttempts,
          attemptCount: 0,
          remindersSent: 0,
          emailDeliveryStatus: 'PENDING',
          invitationLink,
          invitationToken,
        },
        include: {
          company: true,
          inviter: true,
        },
      });

      invitationIds.push(invitation.id);
      createdInvitations.push(invitation);
    }

    return {
      invitationIds,
      invitations: createdInvitations,
      count: createdInvitations.length,
    };
  }

  async updateInvitation(updateInvitationDto: UpdateInvitationDto) {
    const { invitationId, ...updateData } = updateInvitationDto;

    const invitation = await this.prisma.candidateInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${invitationId} not found`);
    }

    const updatedInvitation = await this.prisma.candidateInvitation.update({
      where: { id: invitationId },
      data: {
        ...updateData,
        ...(updateData.status && { status: updateData.status as InvitationStatus }),
        ...(updateData.emailDeliveryStatus && { emailDeliveryStatus: updateData.emailDeliveryStatus as EmailDeliveryStatus }),
        ...(updateData.sentAt && { sentAt: new Date(updateData.sentAt) }),
        ...(updateData.expiresAt && { expiresAt: new Date(updateData.expiresAt) }),
        ...(updateData.lastReminderSent && { lastReminderSent: new Date(updateData.lastReminderSent) }),
        updatedAt: new Date(),
      },
      include: {
        company: true,
        inviter: true,
      },
    });

    return updatedInvitation;
  }

  async expireOldInvitations() {
    const now = new Date();
    
    const expiredInvitations = await this.prisma.candidateInvitation.updateMany({
      where: {
        expiresAt: {
          lte: now,
        },
        status: {
          in: ['SENT', 'OPENED', 'STARTED'],
        },
      },
      data: {
        status: 'EXPIRED',
        updatedAt: now,
      },
    });

    return {
      message: `${expiredInvitations.count} invitations expired`,
      expiredCount: expiredInvitations.count,
    };
  }

  async getEmailTemplates(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    return this.prisma.emailTemplate.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createEmailTemplate(createEmailTemplateDto: CreateEmailTemplateDto) {
    const { companyId, ...templateData } = createEmailTemplateDto;

    // Verify company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    return this.prisma.emailTemplate.create({
      data: {
        ...templateData,
        companyId,
        htmlContent: templateData.htmlContent,
        subject: templateData.subject,
        textContent: templateData.textContent,
        isActive: templateData.isActive ?? true,
        type: createEmailTemplateDto.type,
      },
    });
  }
}
