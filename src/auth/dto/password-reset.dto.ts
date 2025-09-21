import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PasswordResetDto {
    @ApiProperty({
        description: 'The next password of the user',
        example: "pass@bod"
    })
    @IsString()
    @IsNotEmpty()
    password: string

    @ApiProperty({
        description: 'The confirmation of the same password of the user',
        example: "pass@bod"
    })
    @IsString()
    @IsNotEmpty()
    confirmPassword: string
}