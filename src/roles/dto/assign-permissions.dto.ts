import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export class AssignPermissionsDto {
    @ApiProperty({
        description: "The id of the role",
        example: "a4594765-4d59-40b1-9db2-242d219b1b58",
    })
    @IsString()
    roleId: string;

    @ApiProperty({
        description:
            "The ids of the permissions the user wish to assign the provided role with",
        example: ["a4594765-4d59-40b1-9db2-242d219b1b58", "a4594765-4d59-40b1-9db2-242d219b1b58"],
    })
    @IsArray()
    @IsString({ each: true })
    permissions: string[];
}
