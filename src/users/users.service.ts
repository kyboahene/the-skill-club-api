import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '@/pagination/pagination.service';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserWithRelationsEntity } from './entities/user-with-relations.entity';

@Injectable()
export class UsersService {
  constructor(private paginationService: PaginationService, private prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.fullName,
        ...(data.roleId && {
          roles: {
            connect: {
              id: data.roleId,
            },
          },
        }),
      },
    });
  }

  async findUsers(page: number, pageSize: number, all?: boolean, search?: string) {
    const include: Prisma.UserInclude = {
      roles: {
        include: {
          permissions: true,
        },
      },
    }

    const where: Prisma.UserWhereInput = {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ],
    }

    return await this.paginationService.paginate<UserWithRelationsEntity>("user", {
      all,
      page,
      pageSize,
      include,
      where,
    })
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUser(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
