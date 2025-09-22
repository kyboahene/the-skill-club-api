import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../pagination/pagination.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  GetCompaniesDto,
  CreateCompanyWithOwnerDto,
  AddCompanyUserDto,
  UpdateCompanyUserDto,
} from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService
  ) {}

  async findCompanies(
    page: number,
    pageSize: number,
    all?: boolean,
    filters?: {
      search?: string;
      type?: string;
      companySize?: string;
      market?: string;
      country?: string;
    }
  ) {
    const where: Prisma.CompanyWhereInput = {};
    
    if (filters?.type) where.type = filters.type;
    if (filters?.companySize) where.companySize = filters.companySize;
    if (filters?.market) where.market = filters.market;
    if (filters?.country) where.country = filters.country;
    
    if (filters?.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          overview: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          type: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const include: Prisma.CompanyInclude = {
      companyMembers: true,
    };

    return await this.paginationService.paginate("company", {
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
  async getAllCompanies(query: GetCompaniesDto) {
    const { limit = 10, type, companySize, market, country, search } = query;
    
    return this.findCompanies(1, limit, false, {
      search,
      type,
      companySize,
      market,
      country,
    });
  }

  async getCompany(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        companyMembers: true,
        jobs: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        assessments: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async createCompany(createCompanyDto: CreateCompanyDto) {
    try {
      return await this.prisma.company.create({
        data: {
          ...createCompanyDto,
        },
        include: {
          companyMembers: true,
          },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Company with this name already exists");
        }
      }
      throw error;
    }
  }


  async addUserToCompany(addCompanyUserDto: AddCompanyUserDto) {
    const { companyId, email, name, role, invitedBy } = addCompanyUserDto;

    // Check if company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Check if user is already part of the company
    if (user) {
      const existingCompanyUser = await this.prisma.user.findFirst({
        where: {
          companyId: companyId,
        },
      });

      if (existingCompanyUser) {
        throw new ConflictException('User is already part of this company');
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      // Create user if doesn't exist
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            roles: {
              connect: {
                id: 'company_user',
              },
            },
            status: 'PENDING',
          },
        });
      }

      // Create company user relationship
      const companyUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          companyId,
          roles: {
            connect: {
              id: 'company_admin',
            },
          },
        },
      });

      return {
        userId: user.id,
        companyUser,
        user,
      };
    });
  }

  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async updateCompanyUser(userId: string, updateCompanyUserDto: UpdateCompanyUserDto) {
    const companyUser = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!companyUser) {
      throw new NotFoundException(`Company user with user ID ${userId} not found`);
    }

    const updateData: any = {};
    if (updateCompanyUserDto.role) {
      updateData.roles = {
        connect: {
          id: updateCompanyUserDto.role.toUpperCase(),
        },
      };
    }
    if (updateCompanyUserDto.status) {
      updateData.isActive = updateCompanyUserDto.status.toUpperCase() === 'ACTIVE';
    }
    if (updateCompanyUserDto.permissions) {
      updateData.permissions = updateCompanyUserDto.permissions;
    }

    return this.prisma.user.update({
      where: { id: companyUser.id },
      data: updateData,
      include: {
        company: true,
      },
    });
  }

  async removeCompanyUser(userId: string) {
    const companyUser = await this.prisma.user.findFirst({
      where: { id:userId },
    });

    if (!companyUser) {
      throw new NotFoundException(`Company user with user ID ${userId} not found`);
    }

    await this.prisma.user.delete({
      where: { id: companyUser.id },
    });

    return { message: 'Company user removed successfully' };
  }
}
