import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiBadRequestResponse, ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { Auth } from '@/auth/decorator';

import { EventsService } from './events.service';

import { EventEntity } from './entities/event.entity';
import { EventWithRelationEntity } from './entities';

import { Serialize } from '@/shared/interceptors/serializer.interceptor';
import { PaginatedResponseDto } from '@/pagination/pagination.entity';

import { CreateEventDto, UpdateEventDto, GetEventsDto } from './dto';

@ApiTags('Events')
@Controller('events')
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Auth(['get_events', 'get_events_global'])
  @Get()
  @Serialize(PaginatedResponseDto(EventWithRelationEntity))
  @ApiOperation({
    summary: "Returns a paginated list of events",
    description: 'Required permissions: "get_events" or "get_events_global"',
  })
  @ApiCreatedResponse({
    description: "Returns a paginated list of events",
    type: PaginatedResponseDto(EventWithRelationEntity)
  })
  @ApiBadRequestResponse({
    description: 'Events cannot be retrieved. Try again!'
  })
  async findAll(
    @Query("pageNum") page: string = "1",
    @Query("pageSize") pageSize: string = "10",
    @Query("all") all: string = "false",
    @Query("search") search?: string,
    @Query("category") category?: string,
  ) {
    return this.eventsService.findEvents(+page, +pageSize, JSON.parse(all), {
      search,
      category,
    });
  }

  @Auth(['get_event', 'get_event_global'])
  @Get(':id')
  @ApiOperation({
    summary: "Returns a single event by id",
    description: 'Required permissions: "get_event" or "get_event_global"',
  })
  @ApiCreatedResponse({
    description: 'Returns a single event with full details',
    type: EventWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Event cannot be retrieved. Try again!'
  })
  async findOne(@Param('id') id: string) {
    return this.eventsService.getEvent(id);
  }

  @Auth(['add_event', 'add_event_global'])
  @Post()
  @ApiOperation({
    summary: "Creates and returns created event",
    description: 'Required permissions: "add_event" or "add_event_global"',
  })
  @ApiCreatedResponse({
    description: "Created event object as response",
    type: EventWithRelationEntity
  })
  @ApiBadRequestResponse({
    description: 'Event cannot be created. Try again!'
  })
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.createEvent(createEventDto);
  }

  @Auth(['update_event', 'update_event_global'])
  @Patch(':id')
  @ApiOperation({
    summary: "Updates an event by id and returns it",
    description: 'Required permissions: "update_event" or "update_event_global"',
  })
  @ApiCreatedResponse({
    description: "Returns updated event",
    type: EventWithRelationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Event cannot be updated. Try again!'
  })
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.updateEvent(id, updateEventDto);
  }

  @Auth(['delete_event', 'delete_event_global'])
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletes an event by id',
    description: 'Required permissions: "delete_event" or "delete_event_global"',
  })
  @ApiCreatedResponse({
    description: 'Event deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Event cannot be deleted. Try again!'
  })
  async remove(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }
}
