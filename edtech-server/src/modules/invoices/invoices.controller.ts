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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, RecordInvoicePaymentDto } from './dto/invoice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('invoices')
@Controller('invoices')
@ApiBearerAuth()
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.invoicesService.findAll(query, status, studentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.superadmin, UserRole.admin)
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }

  @Post(':id/payments')
  @Roles(UserRole.superadmin, UserRole.admin)
  recordPayment(@Param('id') id: string, @Body() dto: RecordInvoicePaymentDto) {
    return this.invoicesService.recordPayment(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.superadmin, UserRole.admin)
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}
