import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from './dto/role.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from './permissions.constants';

@ApiTags('roles')
@Controller()
@ApiBearerAuth()
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get('roles')
  @Roles(UserRole.superadmin, UserRole.admin)
  findAll(@Query() query: PaginationDto) {
    return this.rolesService.findAll(query);
  }

  @Get('roles/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Get('permissions')
  @Roles(UserRole.superadmin, UserRole.admin)
  permissions() {
    return {
      modules: PERMISSION_MODULES,
      actions: PERMISSION_ACTIONS,
    };
  }

  @Post('roles')
  @Roles(UserRole.superadmin, UserRole.admin)
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Put('roles/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Put('roles/:id/permissions')
  @Roles(UserRole.superadmin, UserRole.admin)
  updatePermissions(@Param('id') id: string, @Body() dto: UpdateRolePermissionsDto) {
    return this.rolesService.updatePermissions(id, dto);
  }

  @Delete('roles/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
