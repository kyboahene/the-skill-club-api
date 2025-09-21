import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssessmentDto, GetAssessmentsPerSkillDto, UpdateAssessmentDto } from './dto/create-assessment.dto';

@Injectable()
export class AssessmentsService {
  constructor(private prisma: PrismaService) {}

  async getAllAssessments() {
    return this.prisma.assessment.findMany({
      include: {
        skill: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAssessmentsPerSkill(query: GetAssessmentsPerSkillDto) {
    const { skill, limitCount = 10, search } = query;
    
    const where: any = {};
    
    if (skill) {
      where.skill = {
        name: {
          equals: skill,
          mode: 'insensitive',
        },
      };
    }

    if (search) {
      where.question = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const assessments = await this.prisma.assessment.findMany({
      where,
      include: {
        skill: true,
      },
      take: limitCount,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      assessments,
      count: assessments.length,
    };
  }

  async getAssessment(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        skill: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    return assessment;
  }

  async getCandidateSessionsByAssessmentId(assessmentId: string) {
    return this.prisma.candidateSession.findMany({
      where: { assessmentId },
      include: {
        answers: true,
        scoreSummary: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createAssessment(createAssessmentDto: CreateAssessmentDto) {
    const { skill, ...assessmentData } = createAssessmentDto;
    
    let skillId = null;
    if (skill) {
      const skillRecord = await this.prisma.skill.findFirst({
        where: { name: { equals: skill, mode: 'insensitive' } },
      });
      skillId = skillRecord?.id;
    }

    return this.prisma.assessment.create({
      data: {
        ...assessmentData,
        skillId,
      },
      include: {
        skill: true,
      },
    });
  }

  async updateAssessment(id: string, updateAssessmentDto: UpdateAssessmentDto) {
    const { skill, ...assessmentData } = updateAssessmentDto;
    
    let skillId = undefined;
    if (skill) {
      const skillRecord = await this.prisma.skill.findFirst({
        where: { name: { equals: skill, mode: 'insensitive' } },
      });
      skillId = skillRecord?.id;
    }

    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    return this.prisma.assessment.update({
      where: { id },
      data: {
        ...assessmentData,
        ...(skillId !== undefined && { skillId }),
      },
      include: {
        skill: true,
      },
    });
  }

  async deleteAssessment(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    await this.prisma.assessment.delete({
      where: { id },
    });

    return { message: 'Assessment deleted successfully' };
  }
}
