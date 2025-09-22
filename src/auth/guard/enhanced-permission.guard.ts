import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from '../../utils/role.service';
import { ENHANCED_AUTH_KEY, AuthOptions } from '../decorator/enhanced-auth.decorator';

@Injectable()
export class EnhancedPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authOptions = this.reflector.get<AuthOptions>(
      ENHANCED_AUTH_KEY,
      context.getHandler()
    );

    if (!authOptions) {
      return true; // No auth requirements
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const companyId = request.params?.companyId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check company membership if required
    // if (authOptions.requireCompanyMembership && companyId) {
    //   const isMember = await this.roleService.isCompanyMember(user.id, companyId);
    //   if (!isMember) {
    //     throw new ForbiddenException('User is not a member of this company');
    //   }
    // }

    // Check permissions if specified
    if (authOptions.permissions && authOptions.permissions.length > 0) {
      const context = authOptions.context ? {
        type: authOptions.context,
        id: authOptions.context === 'COMPANY' ? companyId : undefined
      } : undefined;

      if (authOptions.requireAllPermissions) {
        // AND logic - user must have ALL permissions
        for (const permission of authOptions.permissions) {
          const hasPermission = await this.roleService.hasPermission(
            user.id,
            permission,
            context
          );
          if (!hasPermission) {
            throw new ForbiddenException(`Missing required permission: ${permission}`);
          }
        }
      } else {
        // OR logic - user must have AT LEAST ONE permission
        const hasAnyPermission = await Promise.all(
          authOptions.permissions.map(permission =>
            this.roleService.hasPermission(user.id, permission, context)
          )
        );

        if (!hasAnyPermission.some(Boolean)) {
          throw new ForbiddenException(
            `Missing required permissions: ${authOptions.permissions.join(' or ')}`
          );
        }
      }
    }

    return true;
  }
}
