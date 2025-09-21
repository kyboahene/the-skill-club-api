import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class SendNotificationDto {
    @ApiProperty({
        example: ["email", "sms"]
    })
    @IsArray()
    @IsString({ each: true })
    medium: string[]

    @ApiProperty({
        description: "The subject of the message",
        example: "General Information"
    })
    @IsOptional()
    @IsString()
    subject: string;

    @ApiProperty({
        description: "The message to be sent",
        example: "This is a general information message"
    })
    @IsString()
    message: string;
}