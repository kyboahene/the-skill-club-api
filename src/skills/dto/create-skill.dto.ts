import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty({ required: false })
  description?: string;
}
