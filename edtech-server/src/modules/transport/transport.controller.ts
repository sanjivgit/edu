import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TransportService } from './transport.service';
import {
  CreateRouteDto,
  UpdateRouteDto,
  AssignStudentDto,
  CreateVehicleDto,
} from './dto/transport.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('transport')
@Controller('transport')
@ApiBearerAuth()
export class TransportController {
  constructor(private transportService: TransportService) {}

  @Get('routes')
  routes(@Query() query: PaginationDto) {
    return this.transportService.findRoutes(query);
  }

  @Get('routes/:id')
  route(@Param('id') id: string) {
    return this.transportService.findRoute(id);
  }

  @Get('routes/:id/assignments')
  assignments(@Param('id') id: string) {
    return this.transportService.getAssignments(id);
  }

  @Post('routes')
  @Roles(UserRole.superadmin, UserRole.admin)
  createRoute(@Body() dto: CreateRouteDto) {
    return this.transportService.createRoute(dto);
  }

  @Put('routes/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  updateRoute(@Param('id') id: string, @Body() dto: UpdateRouteDto) {
    return this.transportService.updateRoute(id, dto);
  }

  @Delete('routes/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  removeRoute(@Param('id') id: string) {
    return this.transportService.removeRoute(id);
  }

  @Post('assign')
  @Roles(UserRole.superadmin, UserRole.admin)
  assign(@Body() dto: AssignStudentDto) {
    return this.transportService.assignStudent(dto);
  }

  @Delete('assignments/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  unassign(@Param('id') id: string) {
    return this.transportService.unassignStudent(id);
  }

  @Get('vehicles')
  vehicles() {
    return this.transportService.findVehicles();
  }

  @Post('vehicles')
  @Roles(UserRole.superadmin, UserRole.admin)
  createVehicle(@Body() dto: CreateVehicleDto) {
    return this.transportService.createVehicle(dto);
  }

  @Get('track/:vehicleId')
  track(@Param('vehicleId') vehicleId: string) {
    return this.transportService.trackVehicle(vehicleId);
  }

  @Patch('track/:vehicleId')
  @Roles(UserRole.superadmin, UserRole.admin)
  updateLocation(
    @Param('vehicleId') vehicleId: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ) {
    return this.transportService.updateVehicleLocation(vehicleId, latitude, longitude);
  }
}
