import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../entities';

export const CheckGlobalPermission = createParamDecorator(
    (permission: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user: AuthenticatedUser = request.user;

        const hasGlobalPermission = user.role.some(role =>
            role.permissions.some(p => p.name === permission),
        );

        if (!hasGlobalPermission) {
            return user.member ? user.member.id : null;
        }
        return undefined;
    },
);
