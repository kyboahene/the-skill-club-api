import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiBadRequestResponse, ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { Auth } from '@/auth/decorator';

import { TalentsService } from './talents.service';

import { TalentEntity } from './entities/talent.entity';
import { TalentWithRelationEntity } from './entities';

import { Serialize } from '@/shared/interceptors/serializer.interceptor';

import { CreateTalentDto, GetTalentsDto, UpdateTalentProfileDto } from './dto';

@ApiTags('Talents')
@Controller('talents')
@ApiBearerAuth()
export class TalentsController {
  constructor(private readonly talentsService: TalentsService) {}

  @Auth(['get_talents', 'get_talents_global'])
  @Get()
  @Serialize(TalentWithRelationEntity)
  @ApiOperation({
    summary: "Returns a list of talents",
    description: 'Required permissions: "get_talents" or "get_talents_global"',
  })
  @ApiCreatedResponse({
    description: "Returns a list of talents with their profiles",
    type: [TalentWithRelationEntity]
  })
  @ApiBadRequestResponse({
    description: 'Talents cannot be retrieved. Try again!'
  })
  async getTalents(@Query() query: GetTalentsDto) {
    return this.talentsService.getTalents(query);
  }

  @Auth(['create_talent', 'create_talent_global'])
  @Post()
  @ApiOperation({
    summary: "Creates a new talent",
    description: 'Required permissions: "create_talent" or "create_talent_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns the created talent',
    type: TalentWithRelationEntity,
  })
  async createTalent(@Body() createTalentDto: CreateTalentDto) {
    return this.talentsService.createTalent(createTalentDto);
  }

  @Auth(['get_talent', 'get_talent_global'])
  @Get(':id')
  @ApiOperation({
    summary: "Returns a single talent by id",
    description: 'Required permissions: "get_talent" or "get_talent_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a single talent with full profile',
    type: TalentWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Talent cannot be retrieved. Try again!'
  })
  async getTalent(@Param('id') id: string) {
    return this.talentsService.getTalent(id);
  }

  @Auth(['get_talent_profile', 'get_talent_profile_global'])
  @Get(':id/profile')
  @ApiOperation({
    summary: "Returns talent profile by user id",
    description: 'Required permissions: "get_talent_profile" or "get_talent_profile_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns talent profile with all related data',
    type: TalentWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Talent profile cannot be retrieved. Try again!'
  })
  async getTalentProfile(@Param('id') id: string) {
    return this.talentsService.getTalentProfile(id);
  }

  @Auth(['update_talent_profile', 'update_talent_profile_global'])
  @Patch(':id/profile')
  @ApiOperation({
    summary: "Updates talent profile by user id",
    description: 'Required permissions: "update_talent_profile" or "update_talent_profile_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns updated talent profile',
    type: TalentWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Talent profile cannot be updated. Try again!'
  })
  async updateTalentProfile(
    @Param('id') id: string,
    @Body() updateTalentProfileDto: UpdateTalentProfileDto,
  ) {
    return this.talentsService.updateTalentProfile(id, updateTalentProfileDto);
  }
}
