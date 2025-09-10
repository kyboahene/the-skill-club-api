import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@/prisma/prisma.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) { }

  async isAllowed(userId: string, permissions: string[]) {
    const exist = await this.checkPermission(userId, permissions)
    if (exist)
      return true

    return false;
  }

  checkPermission(userId: string, permissions: string[]) {
    return new Promise((resolve, reject) => {
      this.prisma.user
        .findUnique({
          where: {
            id: userId,
          },
          select: {
            role: {
              select: {
                permissions: true,
              },
            },
          },
        })
        .then((res) => {
          if (!res || !res.role) {
            resolve(false);
            return;
          }

          const exist = res.role.some((role) => {
            return role.permissions.some((permission) =>
              permissions.includes(permission.name)
            );
          });

          resolve(exist);
        })
        .catch(reject);
    });
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    return this.isAllowed(user.id, permissions);
  }
}
