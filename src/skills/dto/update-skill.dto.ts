import { ApiProperty } from '@nestjs/swagger';

export class UpdateSkillDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty({ required: false })
  description?: string;
}
