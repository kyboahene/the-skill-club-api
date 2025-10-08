import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto, GetAssessmentsPerSkillDto, UpdateAssessmentDto } from './dto/create-assessment.dto';

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  async getAllAssessments() {
    return this.assessmentsService.getAllAssessments();
  }

  @Get('skill')
  async getAssessmentsPerSkill(@Query() query: GetAssessmentsPerSkillDto) {
    return this.assessmentsService.getAssessmentsPerSkill(query);
  }

  @Get(':id')
  async getAssessment(@Param('id') id: string) {
    return this.assessmentsService.getAssessment(id);
  }

  @Get(':id/candidate-sessions')
  async getCandidateSessionsByAssessmentId(@Param('id') assessmentId: string) {
    return this.assessmentsService.getCandidateSessionsByAssessmentId(assessmentId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAssessment(@Body() createAssessmentDto: CreateAssessmentDto) {
    return this.assessmentsService.createAssessment(createAssessmentDto);
  }

  @Patch(':id')
  async updateAssessment(
    @Param('id') id: string,
    @Body() updateAssessmentDto: UpdateAssessmentDto,
  ) {
    return this.assessmentsService.updateAssessment(id, updateAssessmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAssessment(@Param('id') id: string) {
    return this.assessmentsService.deleteAssessment(id);
  }
}
