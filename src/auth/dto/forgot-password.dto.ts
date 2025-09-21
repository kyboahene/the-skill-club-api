import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ForgotPaswordDto {
    @ApiProperty({
        description: 'The email of the user',
        example: "john.doe@gmail.com"
    })
    @IsString()
    @IsNotEmpty()
    email: string
}