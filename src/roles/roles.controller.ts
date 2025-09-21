import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiBadRequestResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

import { Auth } from '@/auth/decorator';

import { RolesService } from './roles.service';

import { RoleEntity } from './entities/role.entity';
import { RoleWithRelationEntity } from './entities';

import { Serialize } from '@/shared/interceptors/serializer.interceptor';

import { AssignPermissionsDto, CreateRoleDto, UpdateRoleDto } from './dto';
import { PaginatedResponseDto, PaginatedResult } from '@/pagination/pagination.entity';

@ApiTags('Role')
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) { }

  @Auth(['add:role'])
  @Post()
  @ApiOperation({
    summary: "Creates and returns created role",
    description: 'Required permissions: "add_role"',
  })
  @ApiCreatedResponse({
    description: "Created role object as response",
    type: RoleEntity
  })
  @ApiBadRequestResponse({
    description: 'Role cannot be created. Try again!'
  })
  create(@Body() data: CreateRoleDto) {
    return this.rolesService.createRole(data);
  }

  @Auth(['get_roles'])
  @Get()
  @Serialize(PaginatedResponseDto(RoleWithRelationEntity))
  @ApiOperation({
    summary: "Returns a paginated list of permissions",
    description: 'Required permissions: "get_roles"',
  })
  @ApiCreatedResponse({
    description: "Returns a paginated list of permissions",
    type: PaginatedResponseDto(RoleWithRelationEntity)
  })
  @ApiBadRequestResponse({
    description: 'Roles cannot be retrieved. Try again!'
  })
  findAll(
    @Query("pageNum") page: string = "1",
    @Query("pageSize") pageSize: string = "10",
    @Query("all") all: string = "false"

  ) {
    return this.rolesService.findRoles(+page, +pageSize, JSON.parse(all));
  }

  @Auth(['assign_permissions'])
  @Post("/permissions/assign")
  @ApiOperation({
    summary: "Assigns permission(s) to a role",
    description: 'Required permissions: "assign_permissions"',
  })
  assignPermissionToRoles(@Body() data: AssignPermissionsDto) {
    return this.rolesService.assignPermissionToRoles(data)
  }

  @Auth(['get_role_permissions'])
  @ApiOperation({
    summary: "Returns an role with their assigned permissions",
    description: 'Required permissions: "get_role_permissions"',
  })
  @ApiCreatedResponse({
    description: "Returns an role with their assigned permissions",
    type: [RoleEntity]
  })
  @Get('role-permissions')
  findRolePermissions() {
    return this.rolesService.findRolePermissions()
  }

  @Auth(['get_role'])
  @ApiOperation({
    summary: "Returns a single permission by id",
    description: 'Required permissions: "get_role"',
  })
  @ApiCreatedResponse({
    description: 'Returns a single permission',
    type: RoleEntity,
  })
  @Get(':id')
  findOne(@Param('id') roleId: string) {
    return this.rolesService.findRoleById(roleId);
  }

  @Auth(['update_role'])
  @ApiCreatedResponse({
    description: "Returns a role",
    type: RoleEntity,
  })
  @ApiOperation({
    summary: "Updates a role by id and returns it",
    description: 'Required permissions: "update_role"',
  })
  @Patch(':id')
  update(@Param('id') roleId: string, @Body() data: UpdateRoleDto) {
    return this.rolesService.updateRole(roleId, data);
  }

  @Auth(['delete_role'])
  @ApiCreatedResponse({
    description: 'Returns a role',
    type: RoleEntity,
  })
  @ApiOperation({
    summary: 'Deletes a role by id and returns it',
    description: 'Required permissions: "delete_role"',
  })
  @Delete(':id')
  remove(@Param('id') roleId: string) {
    return this.rolesService.removeRole(roleId);
  }
}
