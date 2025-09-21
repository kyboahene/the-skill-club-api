import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator'

export class UpdateRoleDto {
    @ApiProperty({
        description: 'The name of the role',
        example: "Super Admin"
    })
    @IsString()
    @IsOptional()
    name: string

    @ApiProperty({
        description: 'The access level of the role',
        example: 6
    })
    @IsOptional()
    @IsNumber()
    access_level?: number
}
