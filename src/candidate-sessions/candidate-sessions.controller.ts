import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CandidateSessionsService } from './candidate-sessions.service';
import {
  CreateCandidateSessionDto,
  UpdateCandidateSessionDto,
  CreateAnswerDto,
  GetCandidateSessionsDto,
} from './dto/create-candidate-session.dto';

@Controller('candidate-sessions')
export class CandidateSessionsController {
  constructor(private readonly candidateSessionsService: CandidateSessionsService) {}

  @Get()
  async getCandidateSessions(@Query() query: GetCandidateSessionsDto) {
    return this.candidateSessionsService.getCandidateSessions(query);
  }

  @Get(':id')
  async getCandidateSession(@Param('id') id: string) {
    return this.candidateSessionsService.getCandidateSession(id);
  }

  @Get(':id/answers')
  async getSessionAnswers(@Param('id') sessionId: string) {
    return this.candidateSessionsService.getSessionAnswers(sessionId);
  }

  @Get(':id/score-summary')
  async getSessionScoreSummary(@Param('id') sessionId: string) {
    return this.candidateSessionsService.getSessionScoreSummary(sessionId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCandidateSession(@Body() createCandidateSessionDto: CreateCandidateSessionDto) {
    return this.candidateSessionsService.createCandidateSession(createCandidateSessionDto);
  }

  @Post(':id/answers')
  @HttpCode(HttpStatus.CREATED)
  async createAnswer(@Body() createAnswerDto: CreateAnswerDto) {
    return this.candidateSessionsService.createAnswer(createAnswerDto);
  }

  @Put(':id')
  async updateCandidateSession(
    @Param('id') id: string,
    @Body() updateCandidateSessionDto: UpdateCandidateSessionDto,
  ) {
    return this.candidateSessionsService.updateCandidateSession(id, updateCandidateSessionDto);
  }
}
