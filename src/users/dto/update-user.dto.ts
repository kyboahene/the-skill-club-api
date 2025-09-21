import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { UserStatus } from "@prisma/client";

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: 'The status of the user',
        example: 'ACTIVE'
    })
    @IsEnum(UserStatus)
    @IsOptional()
    status: UserStatus;
}