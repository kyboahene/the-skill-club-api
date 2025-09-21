import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RoleEntity {
    @ApiProperty({
        description: "The id of the role",
        example: "fc8f9ce8-421c-4a57-8afe-e9dff804df8c"
    })
    @Expose()
    id: string

    @ApiProperty({
        description: "The name of the role",
        example: "Super Admin"
    })
    @Expose()
    name: string

    @ApiProperty({
        description: "The date and time it was created",
        example: "2024-11-27T11:15:46.413Z"
    })
    @Expose()
    createdAt: Date

    @ApiProperty({
        description: "The date and time it was updated",
        example: "2024-11-27T11:15:46.413Z"
    })
    @Expose()
    updatedAt: Date
}
