import { Type } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type as TransformType } from 'class-transformer';

export class PaginatedResult<T> {
    @ApiProperty({
        isArray: true,
        // type: (T as Type)
    })
    @Expose()
    data: T[];

    @ApiProperty({
        example: 10
    })
    @Expose()
    total: number;

    @ApiProperty({
        example: 1
    })
    @Expose()
    page: number;

    @ApiProperty({
        example: 5
    })
    @Expose()
    pageSize: number;

    @ApiProperty({
        example: 5
    })
    @Expose()
    totalPages: number;
}

export class PaginationOptions {
    all: boolean
    page: number;
    pageSize: number;
    include?: object;
    where?: Record<string, any>;
    select?: Prisma.SelectAndInclude
    orderBy?: Record<string, 'asc' | 'desc'>;
}

export function PaginatedResponseDto<T>(itemType: Type<T>) {
    class PaginatedResponseClass {
        @ApiProperty({ type: itemType, isArray: true })
        @Expose()
        @TransformType(() => itemType)
        data: T[];

        @ApiProperty({ example: 10 })
        @Expose()
        total: number;

        @ApiProperty({ example: 1 })
        @Expose()
        page: number;

        @ApiProperty({ example: 5 })
        @Expose()
        pageSize: number;

        @ApiProperty({ example: 5 })
        @Expose()
        totalPages: number;
    }

    return PaginatedResponseClass;
}
