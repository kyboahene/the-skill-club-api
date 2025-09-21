import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../pagination/pagination.service';
import { CreateEventDto, UpdateEventDto, GetEventsDto } from './dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService
  ) {}

  async findEvents(
    page: number,
    pageSize: number,
    all?: boolean,
    filters?: {
      search?: string;
      category?: string;
    }
  ) {
    const where: Prisma.EventWhereInput = {};
    
    if (filters?.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (filters?.category) {
      where.category = filters.category as any;
    }

    return await this.paginationService.paginate("event", {
      all,
      page,
      pageSize,
      where,
      orderBy: {
        date: 'desc',
      },
    });
  }

  // Legacy method for backward compatibility
  async getEvents(query: GetEventsDto) {
    const { limit = 10, search } = query;
    
    return this.findEvents(1, limit, false, {
      search,
    });
  }

  async getEvent(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async createEvent(createEventDto: CreateEventDto) {
    try {
      return await this.prisma.event.create({
        data: createEventDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Event with this title already exists");
        }
      }
      throw error;
    }
  }

  async updateEvent(id: string, updateEventDto: UpdateEventDto) {
    await this.getEvent(id);

    return this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });
  }

  async deleteEvent(id: string) {
    await this.getEvent(id);

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }
}
