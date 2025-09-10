import { SetMetadata } from '@nestjs/common';

export const Permission = (roles: string) => SetMetadata('permissions', roles);
