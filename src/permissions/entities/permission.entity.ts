import { ApiProperty } from "@nestjs/swagger"
import { Expose } from "class-transformer"

export class PermissionEntity {
    @ApiProperty({
        example: "4670619b-14b1-426d-86f1-d4bc0f14b9b3"
    })
    @Expose()
    id: string

    @ApiProperty({
        example: "get_permissions"
    })
    @Expose()
    name: string

    @ApiProperty({
        example: "2024-12-16T17:17:04.500Z"
    })
    @Expose()
    createdAt: Date

    @ApiProperty({
        example: "2024-12-16T17:17:04.500Z"
    })
    @Expose()
    updatedAt: Date
}
