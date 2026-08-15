import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRouteDto, UpdateRouteDto, AssignStudentDto, CreateVehicleDto } from './dto/transport.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  async findRoutes(query: PaginationDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.TransportRouteWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { vehicleNo: { contains: query.search, mode: 'insensitive' } },
            { driverName: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      this.prisma.transportRoute.count({ where }),
      this.prisma.transportRoute.findMany({
        where,
        include: {
          stops: true,
          assignments: { include: { student: true } },
        },
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findRoute(id: string) {
    const route = await this.prisma.transportRoute.findUnique({
      where: { id },
      include: {
        stops: { orderBy: { time: 'asc' } },
        assignments: { include: { student: true }, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!route) throw new NotFoundException('Transport route not found');
    return route;
  }

  async createRoute(dto: CreateRouteDto) {
    return this.prisma.transportRoute.create({
      data: {
        name: dto.name,
        vehicleNo: dto.vehicleNo,
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        startsAt: dto.startsAt,
        status: dto.status ?? 'active',
        stops: dto.stops?.length
          ? { create: dto.stops.map((s) => ({ name: s.name, time: s.time })) }
          : undefined,
      },
      include: { stops: true },
    });
  }

  async updateRoute(id: string, dto: UpdateRouteDto) {
    await this.findRoute(id);
    await this.prisma.transportStop.deleteMany({ where: { routeId: id } });
    return this.prisma.transportRoute.update({
      where: { id },
      data: {
        name: dto.name,
        vehicleNo: dto.vehicleNo,
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        startsAt: dto.startsAt,
        status: dto.status,
        stops: dto.stops?.length
          ? { create: dto.stops.map((s) => ({ name: s.name, time: s.time })) }
          : undefined,
      },
      include: { stops: true },
    });
  }

  async removeRoute(id: string) {
    await this.findRoute(id);
    await this.prisma.routeAssignment.deleteMany({ where: { routeId: id } });
    await this.prisma.transportRoute.delete({ where: { id } });
    return { message: 'Transport route deleted successfully' };
  }

  async getAssignments(routeId: string) {
    await this.findRoute(routeId);
    const assignments = await this.prisma.routeAssignment.findMany({
      where: { routeId },
      include: {
        student: { include: { class_: true, section: true } },
      },
    });
    return assignments.map((a) => ({
      id: a.id,
      routeId: a.routeId,
      student: a.student.name,
      rollNo: a.student.rollNo,
      classId: a.student.classId,
      className: a.student.class_?.name,
      section: a.student.section?.name,
      stopName: a.stopName,
    }));
  }

  async assignStudent(dto: AssignStudentDto) {
    const student = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Student not found');
    await this.findRoute(dto.routeId);

    const existing = await this.prisma.routeAssignment.findUnique({
      where: { routeId_studentId: { routeId: dto.routeId, studentId: dto.studentId } },
    });
    if (existing) {
      return this.prisma.routeAssignment.update({
        where: { id: existing.id },
        data: { stopName: dto.stopName },
      });
    }
    return this.prisma.routeAssignment.create({
      data: { routeId: dto.routeId, studentId: dto.studentId, stopName: dto.stopName },
    });
  }

  async unassignStudent(assignmentId: string) {
    await this.prisma.routeAssignment.delete({ where: { id: assignmentId } });
    return { message: 'Assignment removed' };
  }

  async findVehicles() {
    return this.prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createVehicle(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        vehicleNo: dto.vehicleNo,
        name: dto.name,
        capacity: dto.capacity ?? 40,
        status: 'active',
      },
    });
  }

  async trackVehicle(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return {
      id: vehicle.id,
      vehicleNo: vehicle.vehicleNo,
      name: vehicle.name,
      status: vehicle.status,
      latitude: vehicle.latitude ? Number(vehicle.latitude) : null,
      longitude: vehicle.longitude ? Number(vehicle.longitude) : null,
      lastUpdateAt: vehicle.lastUpdateAt,
    };
  }

  async updateVehicleLocation(vehicleId: string, latitude: number, longitude: number) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { latitude, longitude, lastUpdateAt: new Date() },
    });
  }
}
