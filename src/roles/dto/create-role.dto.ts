import { ApiProperty } from '@nestjs/swagger';
import { RoleContext } from '@prisma/client';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator'

export class CreateRoleDto {
    @ApiProperty({
        description: 'The name of the role',
        example: "Super Admin"
    })
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({
        description: 'The context of the role',
        example: "PLATFORM"
    })
    @IsEnum(RoleContext)
    @IsNotEmpty()
    context: RoleContext

    @ApiProperty({
        description: 'The description of the role',
        example: "Super Admin"
    })
    @IsString()
    @IsOptional()
    description: string


    @ApiProperty({
        description: 'The permissions of the role',
        example: ["manage_users", "manage_roles"]
    })
    @IsString()
    @IsOptional()
    permissions: string[]
}
