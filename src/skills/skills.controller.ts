import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Auth } from '@/auth/decorator';
import { SkillsService } from './skills.service';
import { SkillEntity } from './entities/skill.entity';
import { CreateSkillDto, UpdateSkillDto } from './dto';

@ApiTags('Skills')
@Controller('skills')
@ApiBearerAuth()
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Auth(['get_skills', 'get_skills_global'])
  @Get()
  @ApiOperation({
    summary: 'Returns a paginated list of skills',
    description: 'Required permissions: "get_skills" or "get_skills_global"',
  })
  @ApiCreatedResponse({ description: 'Returns a paginated list of skills' })
  @ApiBadRequestResponse({
    description: 'Skills cannot be retrieved. Try again!',
  })
  async findSkills(
    @Query('pageNum') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('all') all: string = 'false',
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.skillsService.findSkills(+page, +pageSize, JSON.parse(all), {
      search,
      category,
    });
  }

  @Auth(['get_skill', 'get_skill_global'])
  @Get(':id')
  @ApiOperation({
    summary: 'Returns a single skill by id',
    description: 'Required permissions: "get_skill" or "get_skill_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a single skill with full details',
  })
  @ApiBadRequestResponse({
    description: 'Skill cannot be retrieved. Try again!',
  })
  async findOne(@Param('id') id: string) {
    return this.skillsService.getSkill(id);
  }

  @Auth(['add_skill', 'add_skill_global'])
  @Post()
  @ApiOperation({
    summary: 'Creates and returns created skill',
    description: 'Required permissions: "add_skill" or "add_skill_global"',
  })
  @ApiCreatedResponse({ description: 'Created skill object as response' })
  @ApiBadRequestResponse({ description: 'Skill cannot be created. Try again!' })
  async create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.createSkill(createSkillDto);
  }

  @Auth(['update_skill', 'update_skill_global'])
  @Put(':id')
  @ApiOperation({
    summary: 'Updates a skill by id and returns it',
    description:
      'Required permissions: "update_skill" or "update_skill_global"',
  })
  @ApiCreatedResponse({ description: 'Returns updated skill' })
  @ApiBadRequestResponse({ description: 'Skill cannot be updated. Try again!' })
  async update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.updateSkill(id, updateSkillDto);
  }

  @Auth(['delete_skill', 'delete_skill_global'])
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletes a skill by id',
    description:
      'Required permissions: "delete_skill" or "delete_skill_global"',
  })
  @ApiCreatedResponse({ description: 'Skill deleted successfully' })
  @ApiBadRequestResponse({ description: 'Skill cannot be deleted. Try again!' })
  async remove(@Param('id') id: string) {
    return this.skillsService.deleteSkill(id);
  }
}
