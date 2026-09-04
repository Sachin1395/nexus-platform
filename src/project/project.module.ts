import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectGuard } from './guards/project.guard';
import { AuthModule } from 'src/auth/auth.module';
import { ApiKeyService } from './api-key.service';
import { AuditLogModule } from 'src/audit-log/audit-log.module';
import { AuditInterceptor } from 'src/audit-log/interceptors/audit.interceptor';

@Module({
  imports: [AuthModule,AuditLogModule],
  providers: [
    ProjectService,
    ProjectGuard,
    ApiKeyService,AuditInterceptor
],
  controllers: [ProjectController]
})
export class ProjectModule {}
