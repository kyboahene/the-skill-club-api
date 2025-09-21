import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiBadRequestResponse, ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { Auth } from '@/auth/decorator';

import { JobsService } from './jobs.service';

import { JobEntity } from './entities/job.entity';
import { JobWithRelationEntity } from './entities';

import { Serialize } from '@/shared/interceptors/serializer.interceptor';
import { PaginatedResponseDto } from '@/pagination/pagination.entity';

import { CreateJobDto, UpdateJobDto, GetJobsDto } from './dto';

@ApiTags('Jobs')
@Controller('jobs')
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Auth(['get_jobs', 'get_jobs_global'])
  @Get()
  @Serialize(PaginatedResponseDto(JobWithRelationEntity))
  @ApiOperation({
    summary: "Returns a paginated list of jobs",
    description: 'Required permissions: "get_jobs" or "get_jobs_global"',
  })
  @ApiCreatedResponse({
    description: "Returns a paginated list of jobs",
    type: PaginatedResponseDto(JobWithRelationEntity)
  })
  @ApiBadRequestResponse({
    description: 'Jobs cannot be retrieved. Try again!'
  })
  async findAll(
    @Query("pageNum") page: string = "1",
    @Query("pageSize") pageSize: string = "10",
    @Query("all") all: string = "false",
    @Query("location") location?: string,
    @Query("jobType") jobType?: string,
    @Query("experience") experience?: string,
    @Query("companyId") companyId?: string,
    @Query("search") search?: string,
  ) {
    return this.jobsService.findJobs(+page, +pageSize, JSON.parse(all), {
      location,
      jobType,
      experience,
      companyId,
      search,
    });
  }

  @Auth(['get_job', 'get_job_global'])
  @Get(':id')
  @ApiOperation({
    summary: "Returns a single job by id",
    description: 'Required permissions: "get_job" or "get_job_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a single job with full details',
    type: JobWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Job cannot be retrieved. Try again!'
  })
  async findOne(@Param('id') id: string) {
    return this.jobsService.getJob(id);
  }

  @Auth(['get_job_applications', 'get_job_applications_global'])
  @Get(':id/applications')
  @ApiOperation({
    summary: "Returns applications for a specific job",
    description: 'Required permissions: "get_job_applications" or "get_job_applications_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns job applications with candidate details',
  })
  @ApiBadRequestResponse({
    description: 'Job applications cannot be retrieved. Try again!'
  })
  async getJobApplications(@Param('id') jobId: string) {
    return this.jobsService.getJobApplications(jobId);
  }

  @Auth(['add_job', 'add_job_global'])
  @Post()
  @ApiOperation({
    summary: "Creates and returns created job",
    description: 'Required permissions: "add_job" or "add_job_global"',
  })
  @ApiCreatedResponse({
    description: "Created job object as response",
    type: JobWithRelationEntity
  })
  @ApiBadRequestResponse({
    description: 'Job cannot be created. Try again!'
  })
  async create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.createJob(createJobDto);
  }

  @Auth(['update_job', 'update_job_global'])
  @Put(':id')
  @ApiOperation({
    summary: "Updates a job by id and returns it",
    description: 'Required permissions: "update_job" or "update_job_global"',
  })
  @ApiCreatedResponse({
    description: "Returns updated job",
    type: JobWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Job cannot be updated. Try again!'
  })
  async update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.updateJob(id, updateJobDto);
  }

  @Auth(['delete_job', 'delete_job_global'])
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletes a job by id',
    description: 'Required permissions: "delete_job" or "delete_job_global"',
  })
  @ApiCreatedResponse({
    description: 'Job deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Job cannot be deleted. Try again!'
  })
  async remove(@Param('id') id: string) {
    return this.jobsService.deleteJob(id);
  }
}
