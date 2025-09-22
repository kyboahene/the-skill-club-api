import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

    console.log(res, "res in service");

    return res;
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
}
