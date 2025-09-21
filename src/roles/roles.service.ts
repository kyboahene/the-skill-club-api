import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma, RoleContext } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

import { PrismaService } from "@/prisma/prisma.service";
import { PaginationService } from "@/pagination/pagination.service";
import { AssignPermissionsDto, CreateRoleDto, UpdateRoleDto } from "./dto";

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService
  ) { }

  async createRole(createRoleDto: CreateRoleDto) {
    try {
      const roles = await this.prisma.role.create({
        data: {
          name: createRoleDto.name,
          isSystem: false,
          description: createRoleDto.description || "",
          context: createRoleDto.context,
          contextId: null,
          permissions: {
            connect: createRoleDto.permissions.map((i) => ({ id: i })),
          },
        },
        include: {
          permissions: true
        }
      });

      return roles;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Role already exists");
        }
      }
    }
  }

  async findRoles(
    page: number,
    pageSize: number,
    all?: boolean
  ) {
    const where: Prisma.RoleWhereInput = {}
    // const include: Prisma.RoleInclude = {}

    return await this.paginationService.paginate("role", {
      all,
      page,
      pageSize,
      // include,
      where
    })
  }

  async findRoleByName(name: string, context: RoleContext, contextId?: string) {
    try {
      const role = await this.prisma.role.findFirst({
        where: { name, context, contextId },
        include: {
          permissions: true
        }
      });

      return role
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Role not found");
        }
      }
      throw error;
    }
  }

  async findRoleById(roleId: string) {
    try {
      const role = await this.prisma.role.findUniqueOrThrow({
        where: { id: roleId },
        include: {
          permissions: true
        }
      });

      return role
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Role not found");
        }
      }
      throw error;
    }
  }

  findRolePermissions() {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
      },
    });
  }

  async upgradeUserRole(userId: string, fromRole: string, toRole: string, context: RoleContext, contextId?: string) {
    try {
      // Remove old role
      const oldRole = await this.prisma.role.findFirst({
        where: {
          name: fromRole,
          context,
          contextId: contextId || null
        }
      });

      if (oldRole) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            roles: {
              disconnect: { id: oldRole.id }
            }
          }
        });
      }

      // Add new role
      if (context === RoleContext.TALENT) {
        await this.assignTalentRole(userId, toRole);
      } else if (context === RoleContext.COMPANY && contextId) {
        await this.assignCompanyRole(userId, contextId, toRole);
      }

      console.log(`Upgraded user ${userId} from ${fromRole} to ${toRole}`);

    } catch (error) {
      console.error('Error upgrading user role:', error);
      throw error;
    }
  }

  async assignTalentRole(userId: string, roleName: string = 'talent') {
    try {
      const talentRole = await this.findRoleByName(roleName, RoleContext.TALENT);

      if (!talentRole) {
        throw new BadRequestException(`Talent role '${roleName}' not found`);
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          roles: {
            connect: { id: talentRole.id }
          }
        }
      });

      console.log(`Assigned ${roleName} role to user ${userId}`);
      return talentRole;

    } catch (error) {
      console.error('Error assigning talent role:', error);
      throw error;
    }
  }

  async assignCompanyRole(userId: string, companyId: string, roleName: string = 'recruiter') {
    try {
      let companyRole = await this.findRoleByName(roleName, RoleContext.COMPANY, companyId)

      // If not, create from template
      if (!companyRole) {
        companyRole = await this.createRole({
          name: roleName,
          context: RoleContext.COMPANY,
          description: "",
          permissions: [],
        });
      }

      // Connect user to role
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          roles: {
            connect: { id: companyRole.id }
          }
        }
      });

      console.log(`Assigned ${roleName} role to user ${userId} for company ${companyId}`);
      return companyRole;

    } catch (error) {
      console.error('Error assigning company role:', error);
      throw error;
    }
  }

  async assignPermissionToRoles(data: AssignPermissionsDto) {
    const role = await this.findRoleById(data.roleId)

    const disconnectPermissions = role.permissions.filter(
      (i) => !data.permissions.find((role) => role === i.id)
    );

    try {
      const res = await this.prisma.role.update({
        where: {
          id: data.roleId,
        },
        data: {
          permissions: {
            connect: data.permissions.map((i) => ({ id: i })),
            disconnect: disconnectPermissions.map((i) => ({ id: i.id })),
          },
        },
      });

      return res;
    } catch (error) {
      throw new Error(error)
    }
  }

  updateRole(id: string, data: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  removeRole(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }
}
