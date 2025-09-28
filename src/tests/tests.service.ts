import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Prisma, TestCategory } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { PrismaService } from "@/prisma/prisma.service";
import { PaginationService } from "@/pagination/pagination.service";
import { CreateTestDto, UpdateTestDto, GetTestsDto } from "./dto";

interface CreateQuestionDto {
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN_ENDED' | 'CODING' | 'VIDEO_RESPONSE';
  prompt: string;
  options?: string[];
  correctAnswer?: any;
  maxScore?: number;
  codeLanguage?: string;
  timeLimitSeconds?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

@Injectable()
export class TestsService {
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
        data: {
          category: createTestDto.category,
          createdBy: createTestDto.createdBy,
          description: createTestDto.description,
          languageCodes: createTestDto.languageCodes,
          title: createTestDto.title,
          validated: createTestDto.validated,
          version: createTestDto.version,
          tags: createTestDto.tags,
          durationSeconds: createTestDto.durationSeconds,
          companyId: createTestDto.companyId,
        },
        include: {
          questions: true,
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
    companyId: string,
    page: number,
    pageSize: number,
    all?: boolean,
    category?: string,
    search?: string
  ) {
    const where: Prisma.TestWhereInput = {};
    
    if (category) {
      where.category = category as TestCategory;
    }
    
    if (companyId) {
      where.createdBy = companyId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    const include: Prisma.TestInclude = {
      questions: true,
    };

    return await this.paginationService.paginate("test", {
      all,
      page,
      pageSize,
      include,
      where
    });
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
          await new Promise(resolve => setTimeout(resolve, 100));
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
      // In this implementation, we're filtering for validated tests from specific company
      const tests = await this.prisma.test.findMany({
        where: { 
          createdBy: companyId,
          validated: true // Only validated tests are considered part of the test bank
        },
        include: {
          questions: true,
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

  // Question Management Methods
  async createQuestion(testId: string, createQuestionDto: CreateQuestionDto) {
    try {
      // First check if test exists
      const test = await this.getTestById(testId);

      const question = await this.prisma.question.create({
        data: {
          testId,
          type: createQuestionDto.type,
          prompt: createQuestionDto.prompt,
          options: createQuestionDto.options || [],
          correctAnswer: createQuestionDto.correctAnswer,
          maxScore: createQuestionDto.maxScore || 1,
          codeLanguage: createQuestionDto.codeLanguage,
          timeLimitSeconds: createQuestionDto.timeLimitSeconds,
          difficulty: createQuestionDto.difficulty || 'MEDIUM',
        }
      });

      return question;
    } catch (error) {
      throw error;
    }
  }

  async bulkCreateQuestions(testId: string, questions: CreateQuestionDto[]) {
    try {
      // First check if test exists
      const test = await this.getTestById(testId);

      // Use a transaction to ensure all questions are created or none
      const result = await this.prisma.$transaction(async (prisma) => {
        const createdQuestions = [];

        for (const questionData of questions) {
          const question = await prisma.question.create({
            data: {
              testId,
              type: questionData.type,
              prompt: questionData.prompt,
              options: questionData.options || [],
              correctAnswer: questionData.correctAnswer,
              maxScore: questionData.maxScore || 1,
              codeLanguage: questionData.codeLanguage,
              timeLimitSeconds: questionData.timeLimitSeconds,
              difficulty: questionData.difficulty || 'MEDIUM',
            }
          });
          createdQuestions.push(question);
        }

        return createdQuestions;
      });

      return {
        success: true,
        questionsCreated: result.length,
        questions: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async getQuestionsByTest(testId: string) {
    try {
      // First check if test exists
      const test = await this.getTestById(testId);

      const questions = await this.prisma.question.findMany({
        where: { testId },
        orderBy: { createdAt: 'asc' }
      });

      return questions;
    } catch (error) {
      throw error;
    }
  }

  async updateQuestion(questionId: string, updateData: Partial<CreateQuestionDto>) {
    try {
      const question = await this.prisma.question.findUnique({
        where: { id: questionId }
      });

      if (!question) {
        throw new NotFoundException("Question not found");
      }

      const updatedQuestion = await this.prisma.question.update({
        where: { id: questionId },
        data: updateData
      });

      return updatedQuestion;
    } catch (error) {
      throw error;
    }
  }

  async deleteQuestion(questionId: string) {
    try {
      const question = await this.prisma.question.findUnique({
        where: { id: questionId }
      });

      if (!question) {
        throw new NotFoundException("Question not found");
      }

      const deletedQuestion = await this.prisma.question.delete({
        where: { id: questionId }
      });

      return deletedQuestion;
    } catch (error) {
      throw error;
    }
  }
}
