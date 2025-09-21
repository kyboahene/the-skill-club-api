import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guard';
import { Auth } from '@/auth/decorator';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth(['add_user'])
  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created' })
  createUser(@Body() data: CreateUserDto) {
    return this.usersService.createUser(data);
  }

  @Auth(['add_user'])
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users retrieved' })
  findUsers(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('all') all: string = 'false',
    @Query('search') search: string = '',
  ) {
    return this.usersService.findUsers(page, pageSize, JSON.parse(all), search);
  }

  @Auth(['get_user'])
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }
}
