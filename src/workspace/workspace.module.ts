import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspaceOwnerGuard } from './guards/workspace-owner.guard';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuditInterceptor } from 'src/audit-log/interceptors/audit.interceptor';

@Module({
  imports: [PrismaModule,AuditLogModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService,WorkspaceOwnerGuard,    WorkspaceMemberGuard,AuditInterceptor],
})
export class WorkspaceModule {}