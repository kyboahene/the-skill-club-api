import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../pagination/pagination.service';
import {
  CreateCandidateSessionDto,
  UpdateCandidateSessionDto,
  CreateAnswerDto,
  GetCandidateSessionsDto,
} from './dto/create-candidate-session.dto';
import { CandidateSessionStatus, Prisma } from '@prisma/client';
import { AssessmentSubmissionDto } from './dto/assessment-submission.dto';

@Injectable()
export class CandidateSessionsService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}

  async getCandidateSessions(query: GetCandidateSessionsDto, companyId: string) {
    const { candidateId, assessmentId, status, page = 1, pageSize = 10, all } = query;

    console.log({companyId});
    
    const where: Prisma.CandidateSessionWhereInput = {
      ...( companyId && { assessment: { company: { id: companyId } } }),
      ...( assessmentId && { assessmentId }),
      ...( candidateId && { candidateId }),
      ...( status && { status: status as CandidateSessionStatus }),
    };

    const include: Prisma.CandidateSessionInclude = {
      assessment: true,
      answers: true,
      scoreSummary: true,
      violations: true,
      deviceInfo: true,
      sessionBehavior: true,
      monitoring: true,
      screenRecording: true,
      trackingData: true,
    };

    const res = await this.paginationService.paginate('candidateSession', {
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

  async checkExistingSession(candidateEmail: string, assessmentId: string) {
    const existingSession = await this.prisma.candidateSession.findFirst({
      where: { 
        candidateEmail, 
        assessmentId 
      },
      include: {
        assessment: true,
        answers: true,
        violations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return existingSession || null;
  }

  async createCandidateSession(
    createCandidateSessionDto: CreateCandidateSessionDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { assessmentId, candidateName, candidateEmail, candidatePhone } = createCandidateSessionDto;
    

    // Verify candidate exists
    const candidate = await this.prisma.candidateSession.findFirst({
      where: { candidateEmail, assessmentId },
    });

    if (candidate) {
      throw new NotFoundException(`${candidateName} with email ${candidateEmail} already exists`);
    }

    // Verify assessment exists
    const assessment = await this.prisma.companyAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }


    return this.prisma.candidateSession.create({
      data: {
        candidateEmail,
        candidateName,
        candidatePhone,
        assessmentId,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
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

    console.log({filters});
    
    const whereClause: Prisma.CandidateSessionWhereInput = {
      assessment: {
        ownerCompanyId: filters.companyId,
      },
    };

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

  async submitAssessment(sessionId: string, data: AssessmentSubmissionDto) {
    const session = await this.prisma.candidateSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${sessionId} not found`);
    }

    // Use transaction to ensure all operations succeed or fail together
    const result = await this.prisma.$transaction(async (tx) => {
      // Create all answers
      await tx.candidateAnswer.createMany({
        data: data.answers.map(answer => ({
          ...answer,
          sessionId,
        })),
      });

      // Store violations if provided
      if (data.violations && data.violations.length > 0) {
        await tx.antiCheatViolation.createMany({
          data: data.violations.map(violation => ({
            ...violation,
            sessionId,
          })),
        });
      }

      // Store device info if provided
      if (data.deviceInfo) {
        await tx.deviceInfo.upsert({
          where: { sessionId },
          update: data.deviceInfo,
          create: {
            sessionId,
            ...data.deviceInfo,
          },
        });
      }

      // Store session behavior if provided
      if (data.sessionBehavior) {
        await tx.sessionBehavior.upsert({
          where: { sessionId },
          update: data.sessionBehavior,
          create: {
            sessionId,
            ...data.sessionBehavior,
          },
        });
      }

      // Store tracking data if provided
      if (data.trackingData && data.trackingData.length > 0) {
        await tx.questionTracking.createMany({
          data: data.trackingData.map(tracking => ({
            sessionId,
            questionId: tracking.questionId,
            timeSpent: tracking.timeSpent,
            attempts: tracking.attempts,
            violations: {
              focusLossCount: tracking.focusLossCount,
              copyPasteAttempts: tracking.copyPasteAttempts,
              rightClickAttempts: tracking.rightClickAttempts,
            },
            behaviorData: {
              keystrokePatterns: tracking.keystrokePatterns,
              mouseMovements: tracking.mouseMovements,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        });
      }

      // Update session status
      const updatedSession = await tx.candidateSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          endTime: new Date(),
        },
        include: {
          answers: true,
          scoreSummary: true,
          violations: true,
          deviceInfo: true,
          sessionBehavior: true,
          trackingData: true,
        },
      });

      return updatedSession;
    });

    // Calculate verification score after successful submission
    let verificationScore = null;
    try {
      verificationScore = await this.calculateVerificationScore(sessionId);
      
      // Store verification score in SessionBehavior
      if (verificationScore) {
        await this.prisma.sessionBehavior.upsert({
          where: { sessionId },
          update: {
            // Add verification score fields to existing behavior data
            suspiciousActivityScore: verificationScore.verificationScore,
          },
          create: {
            sessionId,
            focusLossCount: 0,
            tabSwitchCount: 0,
            rightClickAttempts: 0,
            copyPasteAttempts: 0,
            devToolsAttempts: 0,
            fullscreenExits: 0,
            screenCaptureAttempts: 0,
            totalViolations: 0,
            suspiciousActivityScore: verificationScore.verificationScore,
            timeSpentPerQuestion: {},
          },
        });
      }
    } catch (error) {
      console.error('Failed to calculate verification score:', error);
      // Don't fail the submission if verification score calculation fails
    }

    return { 
      success: true, 
      session: result, 
      verificationScore: verificationScore?.verificationScore || null,
      trustLevel: verificationScore?.trustLevel || null,
      riskFactors: verificationScore?.riskFactors || []
    };
  }

  async calculateVerificationScore(sessionId: string) {
    const session = await this.prisma.candidateSession.findUnique({
      where: { id: sessionId },
      include: {
        violations: true,
        deviceInfo: true,
        sessionBehavior: true,
        monitoring: true,
        trackingData: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${sessionId} not found`);
    }

    // Calculate verification score based on violations and behavioral data
    let verificationScore = 100;
    const riskFactors = [];

    // 1. Deduct points for violations
    if (session.violations && session.violations.length > 0) {
      const violationPenalty = session.violations.reduce((penalty, violation) => {
        switch (violation.severity) {
          case 'HIGH': return penalty + 15;
          case 'MEDIUM': return penalty + 8;
          case 'LOW': return penalty + 3;
          default: return penalty + 5;
        }
      }, 0);
      
      verificationScore -= violationPenalty;
      riskFactors.push({
        factor: 'Anti-cheat violations',
        impact: -violationPenalty,
        count: session.violations.length,
        details: session.violations.map(v => v.type),
      });
    }

    // 2. Analyze device consistency
    if (session.deviceInfo) {
      let deviceRisk = 0;
      const deviceFactors = [];

      // Check for suspicious device characteristics
      if (!session.deviceInfo.cookieEnabled) {
        deviceRisk += 5;
        deviceFactors.push('Cookies disabled');
      }

      if (deviceRisk > 0) {
        verificationScore -= deviceRisk;
        riskFactors.push({
          factor: 'Device inconsistencies',
          impact: -deviceRisk,
          details: deviceFactors,
        });
      }
    }

    // 3. Analyze behavioral patterns
    if (session.sessionBehavior) {
      let behaviorRisk = 0;
      const behaviorFactors = [];

      // Excessive focus loss
      if (session.sessionBehavior.focusLossCount > 10) {
        const penalty = Math.min(20, session.sessionBehavior.focusLossCount * 2);
        behaviorRisk += penalty;
        behaviorFactors.push(`High focus loss: ${session.sessionBehavior.focusLossCount} times`);
      }

      // Excessive tab switching
      if (session.sessionBehavior.tabSwitchCount > 5) {
        const penalty = Math.min(15, session.sessionBehavior.tabSwitchCount * 3);
        behaviorRisk += penalty;
        behaviorFactors.push(`Excessive tab switching: ${session.sessionBehavior.tabSwitchCount} times`);
      }

      // Copy-paste attempts
      if (session.sessionBehavior.copyPasteAttempts > 3) {
        behaviorRisk += 10;
        behaviorFactors.push(`Copy-paste attempts: ${session.sessionBehavior.copyPasteAttempts}`);
      }

      if (behaviorRisk > 0) {
        verificationScore -= behaviorRisk;
        riskFactors.push({
          factor: 'Behavioral anomalies',
          impact: -behaviorRisk,
          details: behaviorFactors,
        });
      }
    }

    // 4. Analyze question-level tracking data
    if (session.trackingData && session.trackingData.length > 0) {
      let trackingRisk = 0;
      const trackingFactors = [];

      // Analyze patterns across questions
      const avgViolationsPerQuestion = session.trackingData.reduce((sum, tracking) => {
        const violations = tracking.violations as any;
        return sum + (violations?.focusLossCount || 0) + (violations?.copyPasteAttempts || 0);
      }, 0) / session.trackingData.length;

      if (avgViolationsPerQuestion > 2) {
        trackingRisk += 10;
        trackingFactors.push(`High violation rate per question: ${avgViolationsPerQuestion.toFixed(1)}`);
      }

      if (trackingRisk > 0) {
        verificationScore -= trackingRisk;
        riskFactors.push({
          factor: 'Question-level tracking anomalies',
          impact: -trackingRisk,
          details: trackingFactors,
        });
      }
    }

    const finalScore = Math.max(0, verificationScore);
    const trustLevel = finalScore >= 80 ? 'HIGH' : finalScore >= 60 ? 'MEDIUM' : 'LOW';

    return {
      verificationScore: finalScore,
      riskFactors,
      trustLevel,
      calculatedAt: new Date(),
    };
  }

  async updateBehavioralProfile(sessionId: string, profileData: any) {
    const session = await this.prisma.candidateSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${sessionId} not found`);
    }

    // Update or create session behavior
    const behavior = await this.prisma.sessionBehavior.upsert({
      where: { sessionId },
      create: {
        sessionId,
        ...profileData,
      },
      update: profileData,
    });

    return behavior;
  }

  async addViolation(sessionId: string, violationData: any) {
    const session = await this.prisma.candidateSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${sessionId} not found`);
    }

    return this.prisma.antiCheatViolation.create({
      data: {
        sessionId,
        type: violationData.type,
        description: violationData.description || violationData.type,
        severity: violationData.severity,
        timestamp: violationData.timestamp || new Date(),
        details: violationData.metadata || {},
      },
    });
  }

  async updateDeviceInfo(sessionId: string, deviceInfo: any) {
    const session = await this.prisma.candidateSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${sessionId} not found`);
    }

    return this.prisma.deviceInfo.upsert({
      where: { sessionId },
      create: {
        sessionId,
        ...deviceInfo,
      },
      update: deviceInfo,
    });
  }

  async updateScreenRecording(sessionId: string, recordingData: any) {
    const session = await this.prisma.candidateSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${sessionId} not found`);
    }

    return this.prisma.screenRecordingData.upsert({
      where: { sessionId },
      create: {
        sessionId,
        ...recordingData,
      },
      update: recordingData,
    });
  }

  async updateTrackingData(sessionId: string, trackingData: any) {
    const session = await this.prisma.candidateSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Candidate session with ID ${sessionId} not found`);
    }

    // QuestionTracking doesn't support upsert with unique sessionId
    // Create new tracking entry instead
    return this.prisma.questionTracking.create({
      data: {
        sessionId,
        questionId: trackingData.questionId,
        timeSpent: trackingData.timeSpent || 0,
        attempts: trackingData.attempts || 1,
        ...trackingData,
      },
    });
  }
}
