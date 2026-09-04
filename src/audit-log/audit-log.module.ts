import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { AuditLogController } from './audit-log.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditInterceptor],
  exports: [AuditLogService, AuditInterceptor],
})
export class AuditLogModule {}