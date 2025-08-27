import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PaginatedResult, PaginationOptions } from './pagination.entity';

@Injectable()
export class PaginationService {
  constructor(private prisma: PrismaService) { }

  async paginate<T>(
    model: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    const { page, pageSize, include, where, orderBy, all } = options;
    if (all) {
      const data = await this.prisma[model].findMany({
        include,
        orderBy,
        where
      });

      return {
        data,
        page: 1,
        totalPages: 1,
        total: data.length,
        pageSize: data.length,
      };
    }

    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma[model].findMany({
        skip,
        take: pageSize,
        include,
        where,
        orderBy,
      }),
      this.prisma[model].count({ where }),
    ]);

    return {
      data,
      page,
      total,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
