import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtGuard } from '../guard';
import { PermissionGuard } from '../guard/permission.guard';

export function Auth(permissions: string[]) {
    return applyDecorators(
        SetMetadata('permissions', permissions),
        UseGuards(JwtGuard, PermissionGuard),
        ApiBearerAuth(),
        ApiUnauthorizedResponse({ description: 'You are not authorized!' }),
    );
}
