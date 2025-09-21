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
   * Add user to company with specific role
   */
  async addUserToCompany(
    userId: string, 
    companyId: string, 
    roleName: string, 
    invitedBy?: string
  ) {
    // Create membership
    await this.prisma.companyMembership.create({
      data: {
        userId,
        companyId,
        invitedBy,
        invitedAt: new Date(),
        isActive: true
      }
    });

    // Find or create company-specific role
    let role = await this.prisma.role.findFirst({
      where: {
        name: roleName,
        context: RoleContext.COMPANY,
        contextId: companyId
      }
    });

    if (!role) {
      // Create role from template
      const template = await this.prisma.role.findFirst({
        where: {
          name: roleName,
          context: RoleContext.COMPANY,
          contextId: null,
          isSystem: true
        },
        include: { permissions: true }
      });
      
      if (!template) {
        throw new Error(`Role template '${roleName}' not found`);
      }

      role = await this.prisma.role.create({
        data: {
          name: roleName,
          description: `${template.description} for company`,
          context: RoleContext.COMPANY,
          contextId: companyId,
          isSystem: false,
          permissions: {
            connect: template.permissions.map(p => ({ id: p.id }))
          }
        }
      });
    }

    // Assign role to user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: { connect: { id: role.id } }
      }
    });

    return role;
  }

  /**
   * Remove user from company
   */
  async removeUserFromCompany(userId: string, companyId: string) {
    // Deactivate membership
    await this.prisma.companyMembership.updateMany({
      where: {
        userId,
        companyId,
        isActive: true
      },
      data: {
        isActive: false,
        leftAt: new Date()
      }
    });

    // Remove company-specific roles
    const companyRoles = await this.prisma.role.findMany({
      where: {
        users: { some: { id: userId } },
        context: RoleContext.COMPANY,
        contextId: companyId
      }
    });

    if (companyRoles.length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          roles: {
            disconnect: companyRoles.map(role => ({ id: role.id }))
          }
        }
      });
    }
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
   * Check if user is member of company
   */
  async isCompanyMember(userId: string, companyId: string): Promise<boolean> {
    const membership = await this.prisma.companyMembership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId
        }
      }
    });

    return membership?.isActive === true;
  }

  /**
   * Get user's active company memberships
   */
  async getUserCompanies(userId: string) {
    return await this.prisma.companyMembership.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        company: true
      }
    });
  }

  /**
   * Get all users in a company with their roles
   */
  async getCompanyUsers(companyId: string) {
    const memberships = await this.prisma.companyMembership.findMany({
      where: {
        companyId,
        isActive: true
      },
      include: {
        user: {
          include: {
            roles: {
              where: {
                context: RoleContext.COMPANY,
                contextId: companyId
              },
              include: {
                permissions: true
              }
            }
          }
        }
      }
    });

    return memberships;
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
