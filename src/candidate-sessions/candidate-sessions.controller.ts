import {
  Controller,
  Get,
  Post,
  Patch,
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

  @Patch(':id')
  async updateCandidateSession(
    @Param('id') id: string,
    @Body() updateCandidateSessionDto: UpdateCandidateSessionDto,
  ) {
    return this.candidateSessionsService.updateCandidateSession(id, updateCandidateSessionDto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  async submitAssessment(
    @Param('id') sessionId: string,
    @Body() submitData: { answers: any[]; totalTimeSpent: number },
  ) {
    return this.candidateSessionsService.submitAssessment(sessionId, submitData);
  }

  @Post(':id/calculate-verification-score')
  @HttpCode(HttpStatus.OK)
  async calculateVerificationScore(@Param('id') sessionId: string) {
    return this.candidateSessionsService.calculateVerificationScore(sessionId);
  }

  @Patch(':id/behavioral-profile')
  async updateBehavioralProfile(
    @Param('id') sessionId: string,
    @Body() profileData: any,
  ) {
    return this.candidateSessionsService.updateBehavioralProfile(sessionId, profileData);
  }

  @Post(':id/violations')
  @HttpCode(HttpStatus.CREATED)
  async addViolation(
    @Param('id') sessionId: string,
    @Body() violationData: { type: string; severity: string; timestamp: Date; metadata?: any },
  ) {
    return this.candidateSessionsService.addViolation(sessionId, violationData);
  }

  @Patch(':id/device-info')
  async updateDeviceInfo(
    @Param('id') sessionId: string,
    @Body() deviceInfo: any,
  ) {
    return this.candidateSessionsService.updateDeviceInfo(sessionId, deviceInfo);
  }

  @Patch(':id/screen-recording')
  async updateScreenRecording(
    @Param('id') sessionId: string,
    @Body() recordingData: any,
  ) {
    return this.candidateSessionsService.updateScreenRecording(sessionId, recordingData);
  }

  @Patch(':id/tracking-data')
  async updateTrackingData(
    @Param('id') sessionId: string,
    @Body() trackingData: any,
  ) {
    return this.candidateSessionsService.updateTrackingData(sessionId, trackingData);
  }
}
