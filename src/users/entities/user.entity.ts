import { ApiProperty } from "@nestjs/swagger"
import { UserStatus } from "@prisma/client"
import { Expose } from "class-transformer"
import { IsEnum } from "class-validator"

export class UserEntity {
    @ApiProperty({
        description: 'The id of the user',
        example: "08612e64-50c3-45ed-8e43-3032f105bf1d"
    })
    @Expose()
    id: string

    @ApiProperty({
        description: 'The name of the user',
        example: "John Doe"
    })
    @Expose()
    name: string

    @ApiProperty({
        description: 'The email of the user',
        example: "john.doe@gmail.com"
    })
    @Expose()
    email: string

    @ApiProperty({
        description: 'The phone of the user',
        example: "+233244567890"
    })
    @Expose()
    phone: string

    @ApiProperty({
        description: 'The status of the user',
        example: "Active"
    })
    @IsEnum(UserStatus)
    @Expose()
    status: UserStatus

    @ApiProperty({
        description: 'The last login at of the user',
        example: '2023-06-20T15:32:07.786Z'
    })
    @Expose()
    lastLoginAt: Date

    @ApiProperty({
        description: 'The email verified at of the user',
        example: '2023-06-20T15:32:07.786Z'
    })
    @Expose()
    emailVerifiedAt: Date

    @ApiProperty({
        description: 'The email verified of the user',
        example: true
    })
    @Expose()
    emailVerified: boolean

    @ApiProperty({
        description: 'The date and time it was created',
        example: '2023-06-20T15:32:07.786Z'
    })
    @Expose()
    createdAt: Date

    @ApiProperty({
        description: 'The date and time it was updated recently',
        example: '2023-06-20T15:32:07.786Z'
    })
    @Expose()
    updatedAt: Date
}