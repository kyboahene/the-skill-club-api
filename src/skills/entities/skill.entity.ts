import { ApiProperty } from '@nestjs/swagger';

export class SkillEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
