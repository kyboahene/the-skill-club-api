import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { PrismaService } from "@/prisma/prisma.service";
import { PaginationService } from "@/pagination/pagination.service";
import { CreateTestDto, UpdateTestDto, GetTestsDto } from "./dto";

@Injectable()
export class TestBankService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService
  ) { }

  async createTest(createTestDto: CreateTestDto) {
    try {
      // Check if test with same title already exists
      const existingTest = await this.prisma.test.findFirst({
        where: { title: createTestDto.title }
      });

      if (existingTest) {
        throw new ForbiddenException("Test with this title already exists");
      }

      const test = await this.prisma.test.create({
        data: createTestDto,
        include: {
          questions: true,
          testConfigs: true,
        }
      });

      return test;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Test already exists");
        }
      }
      throw error;
    }
  }

  async findTests(
    page: number,
    pageSize: number,
    all?: boolean,
    filters?: GetTestsDto
  ) {
    const where: Prisma.TestWhereInput = {};
    
    if (filters?.category) {
      where.category = filters.category;
    }
    
    if (filters?.createdBy) {
      where.createdBy = filters.createdBy;
    }

    if (filters?.validated !== undefined) {
      where.validated = filters.validated;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } }
      ];
    }

    const include: Prisma.TestInclude = {
      questions: true,
      testConfigs: true,
    };

    return await this.paginationService.paginate("test", {
      all,
      page,
      pageSize,
      include,
      where
    });
  }

  // Legacy method for backward compatibility
  async getTests() {
    return this.findTests(1, 10, true);
  }

  async getTestById(testId: string) {
    if (!testId) {
      throw new NotFoundException("Test ID is required");
    }

    try {
      const test = await this.prisma.test.findUnique({
        where: { id: testId },
        include: {
          questions: true,
          testConfigs: true,
        }
      });

      if (!test) {
        throw new NotFoundException("Test not found");
      }

      return test;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error("Error fetching test by ID:", error);
      throw error;
    }
  }

  async getTestsByIds(testIds: string[]) {
    try {
      if (!testIds || testIds.length === 0) {
        return [];
      }

      // Process in batches to handle large arrays efficiently
      const batchSize = 10;
      const results = [];
      
      for (let i = 0; i < testIds.length; i += batchSize) {
        const batch = testIds.slice(i, i + batchSize);
        const batchResults = await this.fetchTestBatch(batch);
        results.push(...batchResults);
        
        // Add small delay between batches to prevent overwhelming the database
        if (i + batchSize < testIds.length) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      return results;
    } catch (error) {
      console.error("Error fetching tests by IDs:", error);
      throw error;
    }
  }

  private async fetchTestBatch(testIds: string[]) {
    if (testIds.length === 0) return [];
    
    const tests = await this.prisma.test.findMany({
      where: {
        id: { in: testIds }
      },
      include: {
        questions: true,
        testConfigs: true,
      }
    });
    
    return tests;
  }

  async getTestsByCompany(companyId: string) {
    try {
      if (!companyId) {
        throw new NotFoundException("Company ID is required");
      }

      const tests = await this.prisma.test.findMany({
        where: { createdBy: companyId },
        include: {
          questions: true,
          testConfigs: true,
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return tests;
    } catch (error) {
      console.error("Error fetching tests by company:", error);
      throw error;
    }
  }

  async getTestsBankByCompany(companyId: string) {
    try {
      if (!companyId) {
        throw new NotFoundException("Company ID is required");
      }

      // This method specifically gets tests from the test bank created by a company
      // In this implementation, we're using the same table but could be filtered differently
      const tests = await this.prisma.test.findMany({
        where: { 
          createdBy: companyId,
          validated: true // Only validated tests are considered part of the test bank
        },
        include: {
          questions: true,
          testConfigs: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log({ tests });
      
      return tests;
    } catch (error) {
      console.error("Error fetching tests bank by company:", error);
      throw error;
    }
  }

  async getTestsFromBank() {
    try {
      // Get all validated tests from the test bank
      const tests = await this.prisma.test.findMany({
        where: { validated: true },
        include: {
          questions: true,
          testConfigs: true,
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return tests;
    } catch (error) {
      console.error("Error fetching tests from bank:", error);
      throw error;
    }
  }

  async updateTest(id: string, updateTestDto: UpdateTestDto) {
    // First check if test exists
    const existingTest = await this.getTestById(id);

    try {
      const updatedTest = await this.prisma.test.update({
        where: { id },
        data: updateTestDto,
        include: {
          questions: true,
          testConfigs: true,
        }
      });

      return updatedTest;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Test with this title already exists");
        }
      }
      throw error;
    }
  }

  async deleteTest(id: string) {
    // First check if test exists
    const existingTest = await this.getTestById(id);

    try {
      const deletedTest = await this.prisma.test.delete({
        where: { id }
      });

      return deletedTest;
    } catch (error) {
      throw error;
    }
  }
}
