import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCandidateSessionDto,
  UpdateCandidateSessionDto,
  CreateAnswerDto,
  GetCandidateSessionsDto,
} from './dto/create-candidate-session.dto';

@Injectable()
export class CandidateSessionsService {
  constructor(private prisma: PrismaService) {}

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
    const assessment = await this.prisma.assessment.findUnique({
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
}
