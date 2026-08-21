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
import { FeesService } from './fees.service';
import {
  CreateFeeStructureDto,
  UpdateFeeStructureDto,
  RecordPaymentDto,
  CreateFeeAndPaymentDto,
  GenerateInvoiceDto,
} from './dto/fees.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('fees')
@Controller('fees')
@ApiBearerAuth()
export class FeesController {
  constructor(private feesService: FeesService) {}

  @Get('structures')
  structures(
    @Query('classId') classId?: string,
    @CurrentUser('tenantId') tenantId?: string,
  ) {
    return this.feesService.findStructures(tenantId, classId);
  }

  @Get('structures/:id')
  structure(@Param('id') id: string) {
    return this.feesService.findStructure(id);
  }

  @Post('structures')
  @Roles(UserRole.superadmin, UserRole.admin)
  createStructure(
    @Body() dto: CreateFeeStructureDto,
    @CurrentUser('tenantId') tenantId?: string,
  ) {
    return this.feesService.createStructure(dto, tenantId);
  }

  @Put('structures/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  updateStructure(@Param('id') id: string, @Body() dto: UpdateFeeStructureDto) {
    return this.feesService.updateStructure(id, dto);
  }

  @Delete('structures/:id')
  @Roles(UserRole.superadmin, UserRole.admin)
  removeStructure(@Param('id') id: string) {
    return this.feesService.removeStructure(id);
  }

  @Get('payments')
  payments(
    @Query() query: PaginationDto,
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
    @Query('classId') classId?: string,
    @Query('section') section?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.feesService.findAllPayments(query, status, studentId, classId, section, academicYearId);
  }

  @Get('payments/overdue')
  overdue() {
    return this.feesService.overduePayments();
  }

  @Get('payments/student/:studentId')
  studentPayments(@Param('studentId') studentId: string) {
    return this.feesService.findStudentPaymentHistory(studentId);
  }

  @Get('payments/:id')
  payment(@Param('id') id: string) {
    return this.feesService.findPayment(id);
  }

  @Post('payments')
  @Roles(UserRole.superadmin, UserRole.admin)
  recordPayment(@Body() dto: RecordPaymentDto) {
    return this.feesService.recordPayment(dto);
  }

  @Post('payments/create-fee')
  @Roles(UserRole.superadmin, UserRole.admin)
  createFeeAndPayment(@Body() dto: CreateFeeAndPaymentDto) {
    return this.feesService.createFeeAndPayment(dto);
  }

  @Post('invoices')
  @Roles(UserRole.superadmin, UserRole.admin)
  generateInvoice(@Body() dto: GenerateInvoiceDto) {
    return this.feesService.generateInvoice(dto);
  }

  @Post('reminders/:studentId')
  @Roles(UserRole.superadmin, UserRole.admin)
  reminder(@Param('studentId') studentId: string) {
    return this.feesService.sendReminder(studentId);
  }

  @Get('parent/child-fees')
  parentChildFees(@CurrentUser('id') parentId: string) {
    return this.feesService.findParentChildFees(parentId);
  }

  @Get('stats')
  stats() {
    return this.feesService.stats();
  }
}
