import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetTalentsDto, CreateTalentDto, UpdateTalentProfileDto } from './dto';
import { PaginationService } from '@/pagination/pagination.service';

@Injectable()
export class TalentsService {
  constructor(private prisma: PrismaService, private paginationService: PaginationService) {}

  async createTalent(data: CreateTalentDto) {
    return this.prisma.talent.create({
      data: {
        gitPortWebsite: data.gitPortWebsite,
        linkedIn: data.linkedIn,
        country: data.country,
        profession: data.profession,
        university: data.university,
        year: data.year,
        mode: data.mode,
        userId: data.userId,
      }
    });
  }

  async getTalents(query: GetTalentsDto) {
    const { limit = 10, skills, location, experienceLevel, search, all, page, pageSize } = query;
    
    const where: Prisma.TalentWhereInput = {
      user: {
        roles: {
          some: {
            name: 'TALENT',
          },
        },
      },
    };
    
    if (search) {
      where.OR = [
        {
          user: {
            name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        },
        {
          user: {
            email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        },
      ];
    }

    if (location) {
      where.user.talent.country = {
        contains: location,
        mode: 'insensitive',
      };
    }

    const include: Prisma.TalentInclude = {
      user: {
        include: {
          talent: true,
        },
      },
    };

    return await this.paginationService.paginate("talent", {
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

  async getTalent(id: string) {
    const talent = await this.prisma.talent.findUniqueOrThrow({
      where: { id },
      include: {
        user: true,
        skills: true,
        education: true,
        workHistory: true,
        personalProjects: true,
        certificates: true,
        applications: {
          include: {
            job: true,
          },
        },
      },
    });

    return talent;
  }

  async getTalentProfile(id: string) {
    const talentProfile = await this.prisma.talent.findFirst({
      where: { userId: id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        workHistory: true,
        education: true,
        personalProjects: true,
        certificates: true,
        user: true,
      },
    });

    if (!talentProfile) {
      throw new NotFoundException(`Talent profile for user ID ${id} not found`);
    }

    return talentProfile;
  }

  async updateTalentProfile(id: string, updateTalentProfileDto: UpdateTalentProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { skills, workHistory, education, projects, certificates, ...profileData } = updateTalentProfileDto;

    return this.prisma.$transaction(async (prisma) => {
      // Find existing talent profile or create new one
      let talentProfile = await prisma.talent.findFirst({
        where: { userId: id },
      });

      if (talentProfile) {
        // Update existing profile
        talentProfile = await prisma.talent.update({
          where: { id: talentProfile.id },
          data: profileData,
        });
      } else {
        // Create new profile
        talentProfile = await prisma.talent.create({
          data: {
            userId: id,
            ...profileData,
          },
        });
      }

      // Handle skills update
      if (skills) {
        // Delete existing talent skills
        await prisma.talentSkill.deleteMany({
          where: { talentId: talentProfile.id },
        });

        // Create or connect skills
        if (skills.length > 0) {
          for (const skillName of skills) {
            // Find or create the skill
            const skill = await prisma.skill.upsert({
              where: { name: skillName },
              create: { name: skillName },
              update: {},
            });

            // Create the talent-skill relationship
            await prisma.talentSkill.create({
              data: {
                talentId: talentProfile.id,
                skillId: skill.id,
              },
            });
          }
        }
      }

      // Handle work history update
      if (workHistory) {
        await prisma.workHistory.deleteMany({
          where: { talentId: talentProfile.id },
        });

        if (workHistory.length > 0) {
          await prisma.workHistory.createMany({
            data: workHistory.map(work => ({
              ...work,
              talentId: talentProfile.id,
            })),
          });
        }
      }

      // Handle education update
      if (education) {
        await prisma.education.deleteMany({
          where: { talentId: talentProfile.id },
        });

        if (education.length > 0) {
          await prisma.education.createMany({
            data: education.map(edu => ({
              ...edu,
              talentId: talentProfile.id,
            })),
          });
        }
      }

      // Handle projects update
      if (projects) {
        await prisma.personalProject.deleteMany({
          where: { talentId: talentProfile.id },
        });

        if (projects.length > 0) {
          await prisma.personalProject.createMany({
            data: projects.map(project => ({
              ...project,
              talentId: talentProfile.id,
            })),
          });
        }
      }

      // Handle certificates update
      if (certificates) {
        await prisma.certificate.deleteMany({
          where: { talentId: talentProfile.id },
        });

        if (certificates.length > 0) {
          await prisma.certificate.createMany({
            data: certificates.map(cert => ({
              ...cert,
              talentId: talentProfile.id,
            })),
          });
        }
      }

      // Return updated profile with relations
      return prisma.talent.findUnique({
        where: { id: talentProfile.id },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          workHistory: true,
          education: true,
          personalProjects: true,
          certificates: true,
          user: true,
        },
      });
    });
  }
}
