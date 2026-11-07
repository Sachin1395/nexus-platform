import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkspaceRole } from '../../generated/prisma/enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuditLogService } from './audit-log.service';

@ApiTags('Audit Logs')
@Controller('workspaces/:workspaceId/audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List audit logs for a workspace' })
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.auditLogService.findAllForWorkspace(workspaceId);
  }
}