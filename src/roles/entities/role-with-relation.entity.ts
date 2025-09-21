import { PermissionEntity } from "@/permissions/entities/permission.entity";
import { RoleEntity } from "./role.entity";
import { Expose, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class RoleWithRelationEntity extends RoleEntity {
    @ApiProperty({
        type: [PermissionEntity],
    })
    @Type(() => PermissionEntity)
    @Expose()
    permissions: PermissionEntity[]
}