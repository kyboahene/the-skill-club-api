import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { RoleContext } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if user has permission in specific context
   */
  async hasPermission(
    userId: string, 
    permission: string, 
    context?: { type: RoleContext; id?: string }
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: { permissions: true },
          where: context ? {
            context: context.type,
            contextId: context.id || null
          } : undefined
        }
      }
    });

    if (!user) return false;

    return user.roles.some(role => 
      role.permissions.some(p => p.name === permission || p.name === '*')
    );
  }

  /**
   * Get user's roles in a specific company
   */
  async getUserCompanyRoles(userId: string, companyId: string) {
    return await this.prisma.role.findMany({
      where: {
        users: { some: { id: userId } },
        context: RoleContext.COMPANY,
        contextId: companyId
      },
      include: { permissions: true }
    });
  }

  /**
   * Get user's platform roles
   */
  async getUserPlatformRoles(userId: string) {
    return await this.prisma.role.findMany({
      where: {
        users: { some: { id: userId } },
        context: RoleContext.PLATFORM
      },
      include: { permissions: true }
    });
  }

  /**
   * Get user's talent roles
   */
  async getUserTalentRoles(userId: string) {
    return await this.prisma.role.findMany({
      where: {
        users: { some: { id: userId } },
        context: RoleContext.TALENT
      },
      include: { permissions: true }
    });
  }

  /**
   * Create custom company role
   */
  async createCompanyRole(
    companyId: string, 
    name: string, 
    description: string,
    permissions: string[]
  ) {
    const permissionRecords = await this.prisma.permission.findMany({
      where: {
        name: { in: permissions }
      }
    });

    return await this.prisma.role.create({
      data: {
        name,
        description,
        context: RoleContext.COMPANY,
        contextId: companyId,
        isSystem: false,
        permissions: {
          connect: permissionRecords.map(p => ({ id: p.id }))
        }
      }
    });
  }

  /**
   * Assign talent role to user
   */
  async assignTalentRole(userId: string, roleName: string = 'verified_talent') {
    const role = await this.prisma.role.findFirst({
      where: {
        name: roleName,
        context: RoleContext.TALENT,
        contextId: null
      }
    });

    if (!role) {
      throw new Error(`Talent role '${roleName}' not found`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: { connect: { id: role.id } }
      }
    });

    return role;
  }
}
