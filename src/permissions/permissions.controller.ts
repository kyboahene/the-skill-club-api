import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionEntity } from './entities/permission.entity';
import { Auth } from '@/auth/decorator';
import { PaginatedResponseDto } from '@/pagination/pagination.entity';

@ApiTags('Permission')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @Auth(['add_permission'])
  @ApiCreatedResponse({
    description: "Returns all permissions",
    type: PermissionEntity
  })
  @ApiOperation({
    summary: "Creates and returns created permission",
    description: 'Required permissions: "add_permission"',
  })
  @Post()
  create(@Body() data: CreatePermissionDto) {
    return this.permissionsService.createPermission(data);
  }

  @Auth(['get_permissions'])
  @ApiCreatedResponse({
    description: "Returns a paginated list of permissions",
    type: PaginatedResponseDto(PermissionEntity)
  })
  @ApiOperation({
    summary: "Returns a paginated list of permissions",
    description: 'Required permissions: "get_permissions"',
  })
  @Get()
  findAll(
    @Query("pageNum") page: string = "1",
    @Query("pageSize") pageSize: string = "10",
    @Query("all") all: string = "false",
    @Query("search") search?: string
  ) {
    return this.permissionsService.findPermissions(+page, +pageSize, JSON.parse(all), search);
  }

  @Auth(['get_permission'])
  @Get(':id')
  @ApiCreatedResponse({
    description: 'Returns a permission',
    type: PermissionEntity,
  })
  @ApiOperation({
    summary: "Returns a single permission by id",
    description: 'Required permissions: "get_permission"',
  })
  findOne(@Param('id') permissionId: string) {
    return this.permissionsService.findPermissionById(permissionId);
  }

  @Auth(['update_permission'])
  @ApiCreatedResponse({
    description: "Returns a permission",
    type: PermissionEntity,
  })
  @ApiOperation({
    summary: "Updates a permission by id and returns it",
    description: 'Required permissions: "update_permission"',
  })
  @Patch(':id')
  update(@Param('id') permissionId: string, @Body() data: UpdatePermissionDto) {
    return this.permissionsService.updatePermission(permissionId, data);
  }

  @Auth(['delete_permission'])
  @ApiCreatedResponse({
    description: 'Returns a permission',
    type: PermissionEntity,
  })
  @ApiOperation({
    summary: 'Deletes a permission by id and returns it',
    description: 'Required permissions: "delete_permission"',
  })
  @Delete(':id')
  remove(@Param('id') permissionId: string) {
    return this.permissionsService.removePermission(permissionId);
  }
}
