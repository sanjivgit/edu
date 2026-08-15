import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantContext } from '../common/tenant/tenant-context.service';

@Global()
@Module({
  providers: [PrismaService, TenantContext],
  exports: [PrismaService, TenantContext],
})
export class PrismaModule {}
