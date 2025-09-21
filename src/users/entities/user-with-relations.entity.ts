import { Expose, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

import { UserEntity } from "./user.entity";
import { RoleEntity } from "@/roles/entities";

export class UserWithRelationsEntity extends UserEntity {
    @Type(() => RoleEntity)
    @ApiProperty({ type: () => [RoleEntity] })
    @Expose()
    role: RoleEntity[]
}