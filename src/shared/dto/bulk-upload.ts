import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class BulkUploadDto {

    @ApiProperty({
        description: 'The file to upload',
        type: 'string',
        format: 'binary',
    })
    @IsString()
    @IsNotEmpty()
    filePath: string;
}