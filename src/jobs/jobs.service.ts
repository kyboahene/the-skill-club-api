import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../pagination/pagination.service';
import { CreateJobDto, UpdateJobDto, GetJobsDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService
  ) {}

  async findJobs(
    page: number,
    pageSize: number,
    all?: boolean,
    filters?: {
      location?: string;
      jobType?: string;
      experience?: string;
      companyId?: string;
      search?: string;
    }
  ) {
    const where: Prisma.JobWhereInput = {};
    
    if (filters?.location) {
      where.workLocation = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    if (filters?.jobType) where.jobType = filters.jobType as any;
    if (filters?.experience) where.experience = filters.experience as any;
    if (filters?.companyId) where.companyId = filters.companyId;

    if (filters?.search) {
      where.OR = [
        {
          jobTitle: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          about: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          requirements: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const include: Prisma.JobInclude = {
      company: true,
      skills: {
        include: {
          skill: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    };

    return await this.paginationService.paginate("job", {
      all,
      page,
      pageSize,
      include,
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  // Legacy method for backward compatibility
  async getJobs(query: GetJobsDto) {
    const { limit = 10, location, type, workMode, experienceLevel, skills, search, companyId } = query;
    
    return this.findJobs(1, limit, false, {
      location,
      jobType: type,
      experience: experienceLevel,
      companyId,
      search,
    });
  }

  async getJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        skills: {
          include: {
            skill: true,
          },
        },
        applications: {
          include: {
            talent: {
              include: {
                user: true,
                skills: {
                  include: {
                    skill: true,
                  },
                },
                workHistory: true,
                education: true,
              },
            },
          },
        },
        interviews: true,
        _count: {
          select: {
            applications: true,
            interviews: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async getJobApplications(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        talent: {
          include: {
            user: true,
            skills: {
              include: {
                skill: true,
              },
            },
            workHistory: true,
            education: true,
            personalProjects: true,
            certificates: true,
          },
        },
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createJob(createJobDto: CreateJobDto) {
    try {
      const { companyId, skills, ...jobData } = createJobDto;

      // Verify company exists
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }

      return await this.prisma.$transaction(async (prisma) => {
        // Create the job
        const job = await prisma.job.create({
          data: {
            companyId,
            status: jobData.status,
            about: jobData.about,
            responsibilities: jobData.responsibilities,
            education: jobData.education,
            pay: jobData.pay,
            minPay: jobData.minPay,
            maxPay: jobData.maxPay,
            jobType: jobData.jobType,
            jobTitle: jobData.jobTitle,
            requirements: jobData.requirements,
            workLocation: jobData.workLocation,
            experience: jobData.experience,
          },
        });

        // Handle skills if provided
        if (skills && skills.length > 0) {
          for (const skillName of skills) {
            // Find or create the skill
            const skill = await prisma.skill.upsert({
              where: { name: skillName },
              create: { name: skillName },
              update: {},
            });

            // Create the job-skill relationship
            await prisma.jobSkill.create({
              data: {
                jobId: job.id,
                skillId: skill.id,
              },
            });
          }
        }

        // Return job with relations
        return prisma.job.findUnique({
          where: { id: job.id },
          include: {
            company: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Job with this title already exists for this company");
        }
      }
      throw error;
    }
  }

  async updateJob(id: string, updateJobDto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    const { skills, ...jobData } = updateJobDto;

    return await this.prisma.$transaction(async (prisma) => {
      // Update the job
      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          jobTitle: jobData.jobTitle,
          about: jobData.about,
          responsibilities: jobData.responsibilities,
          education: jobData.education,
          pay: jobData.pay,
        },
      });

      // Handle skills update if provided
      if (skills !== undefined) {
        // Delete existing job skills
        await prisma.jobSkill.deleteMany({
          where: { jobId: id },
        });

        // Create new skills if provided
        if (skills && skills.length > 0) {
          for (const skillName of skills) {
            // Find or create the skill
            const skill = await prisma.skill.upsert({
              where: { name: skillName },
              create: { name: skillName },
              update: {},
            });

            // Create the job-skill relationship
            await prisma.jobSkill.create({
              data: {
                jobId: id,
                skillId: skill.id,
              },
            });
          }
        }
      }

      // Return updated job with relations
      return prisma.job.findUnique({
        where: { id },
        include: {
          company: true,
          skills: {
            include: {
              skill: true,
            },
          },
          _count: {
            select: {
              applications: true,
              interviews: true,
            },
          },
        },
      });
    });
  }

  async deleteJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    await this.prisma.job.delete({
      where: { id },
    });

    return { message: 'Job deleted successfully' };
  }
}
