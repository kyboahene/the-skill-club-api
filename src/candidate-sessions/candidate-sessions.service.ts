import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../pagination/pagination.service';
import {
  CreateCandidateSessionDto,
  UpdateCandidateSessionDto,
  CreateAnswerDto,
  GetCandidateSessionsDto,
} from './dto/create-candidate-session.dto';

@Injectable()
export class CandidateSessionsService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}

  async getCandidateSessions(query: GetCandidateSessionsDto) {
    const { limit = 10, candidateId, assessmentId, companyId, status } = query;
    
    const where: any = {};
    
    if (candidateId) where.candidateId = candidateId;
    if (assessmentId) where.assessmentId = assessmentId;
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;

    const sessions = await this.prisma.candidateSession.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        answers: true,
        assessment: true,
        scoreSummary: true,
        deviceInfo: true,
        sessionBehavior: true,
        monitoring: true,
        screenRecording: true,
        trackingData: true,
      },
    });

    return {
      sessions,
      count: sessions.length,
    };
  }

  async getCandidateSession(id: string) {
    const session = await this.prisma.candidateSession.findUnique({
      where: { id },
      include: {
        assessment: true,
        answers: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        scoreSummary: true,
        violations: true,
        deviceInfo: true,
        sessionBehavior: true,
        monitoring: true,
        screenRecording: true,
        trackingData: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${id} not found`);
    }

    return session;
  }

  async getSessionAnswers(sessionId: string) {
    const session = await this.prisma.candidateSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${sessionId} not found`);
    }

    return this.prisma.candidateAnswer.findMany({
      where: { sessionId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getSessionScoreSummary(sessionId: string) {
    const session = await this.prisma.candidateSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${sessionId} not found`);
    }

    const scoreSummary = await this.prisma.scoreSummary.findUnique({
      where: { sessionId },
    });

    if (!scoreSummary) {
      throw new NotFoundException(`Score summary for session ${sessionId} not found`);
    }

    return scoreSummary;
  }

  async createCandidateSession(createCandidateSessionDto: CreateCandidateSessionDto) {
    const { candidateId, assessmentId, companyId, ...sessionData } = createCandidateSessionDto;

    // Verify candidate exists
    const candidate = await this.prisma.user.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    // Verify assessment exists
    const assessment = await this.prisma.talentAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    // Verify company exists if provided
    if (companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }
    }

    return this.prisma.candidateSession.create({
      data: {
        candidateEmail: candidate.email,
        candidateName: candidate.name,
        candidatePhone: candidate.phone,
        assessmentId,
      },
      include: {
        assessment: true,
      },
    });
  }

  async createAnswer(createAnswerDto: CreateAnswerDto) {
    const { candidateSessionId, questionId, ...answerData } = createAnswerDto;

    // Verify session exists
    const session = await this.prisma.candidateSession.findUnique({
      where: { id: candidateSessionId },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${candidateSessionId} not found`);
    }

    return this.prisma.candidateAnswer.create({
      data: {
        submittedAt: new Date(),
        timeSpent: answerData.timeSpent,
        response: answerData.answer,
        questionId: questionId,
        sessionId: candidateSessionId,
      },
    });
  }

  async updateCandidateSession(id: string, updateCandidateSessionDto: UpdateCandidateSessionDto) {
    const session = await this.prisma.candidateSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${id} not found`);
    }

    return this.prisma.candidateSession.update({
      where: { id },
      data: {},
      include: {
        assessment: true,
        answers: true,
        scoreSummary: true,
      },
    });
  }

  async getAssessmentCandidateSessions(filters: {
    companyId: string;
    page: number;
    pageSize: number;
    search?: string;
    all?: boolean;
  }) {
    // First, get all candidate sessions for the company
    const whereClause: any = {
      assessment: {
        ownerCompanyId: filters.companyId,
      },
    };

    // Add search filter if provided
    if (filters.search) {
      whereClause.OR = [
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
      ];
    }

    // Get all sessions first to aggregate them
    const allSessions = await this.prisma.candidateSession.findMany({
      where: whereClause,
      include: {
        assessment: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Aggregate sessions by candidate email
    const candidateMap = new Map();

    allSessions.forEach((session) => {
      const key = session.candidateEmail;
      
      if (!candidateMap.has(key)) {
        candidateMap.set(key, {
          candidateEmail: session.candidateEmail,
          candidateName: session.candidateName,
          candidatePhone: session.candidatePhone,
          assessments: [],
          totalAssessments: 0,
          completedAssessments: 0,
          inProgressAssessments: 0,
          abandonedAssessments: 0,
          expiredAssessments: 0,
          lastActivity: session.updatedAt,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        });
      }

      const candidate = candidateMap.get(key);
      
      // Add assessment object if not already included
      const existingAssessment = candidate.assessments.find(
        (assessment: any) => assessment.id === session.assessmentId
      );
      
      if (!existingAssessment) {
        candidate.assessments.push(session.assessment);
        candidate.totalAssessments += 1;
      }

      // Count status
      switch (session.status) {
        case 'COMPLETED':
          candidate.completedAssessments += 1;
          break;
        case 'IN_PROGRESS':
          candidate.inProgressAssessments += 1;
          break;
        case 'ABANDONED':
          candidate.abandonedAssessments += 1;
          break;
        case 'EXPIRED':
          candidate.expiredAssessments += 1;
          break;
      }

      // Update last activity if this session is more recent
      if (session.updatedAt > candidate.lastActivity) {
        candidate.lastActivity = session.updatedAt;
        candidate.updatedAt = session.updatedAt;
      }
    });

    // Convert map to array
    const aggregatedCandidates = Array.from(candidateMap.values());

    // Apply pagination to aggregated results
    const startIndex = (filters.page - 1) * filters.pageSize;
    const endIndex = startIndex + filters.pageSize;
    const paginatedCandidates = aggregatedCandidates.slice(startIndex, endIndex);

    return {
      data: paginatedCandidates,
      total: aggregatedCandidates.length,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.ceil(aggregatedCandidates.length / filters.pageSize),
    };
  }
}
