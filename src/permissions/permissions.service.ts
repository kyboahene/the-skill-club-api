import { PrismaService } from '@/prisma/prisma.service';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PaginationService } from '@/pagination/pagination.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService

  ) { }

  async createPermission(createPermissionDto: CreatePermissionDto) {
    try {
      const roles = await this.prisma.permission.create({
        data: createPermissionDto
      })

      return roles
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException('Permission already exists')
        }
      }

      throw new Error(error)
    }
  }

  findPermissions(
    page: number,
    pageSize: number,
    all: boolean,
    search?: string
  ) {
    const where: Prisma.PermissionWhereInput = {
      AND: {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          },
        ]
      }
    }

    return this.paginationService.paginate('permission', {
      all,
      page,
      where,
      pageSize
    })
  }

  async findPermissionById(permissionId: string) {
    try {
      const permission = await this.prisma.permission.findUnique({
        where: { id: permissionId }
      });

      return permission
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Permission not found");
        }
      }
      throw error;
    }
  }

  updatePermission(permissionId: string, data: UpdatePermissionDto) {
    return this.prisma.permission.update({
      where: { id: permissionId },
      data,
    });
  }

  removePermission(permissionId: string) {
    return this.prisma.permission.delete({
      where: {
        id: permissionId
      }
    });
  }
}
