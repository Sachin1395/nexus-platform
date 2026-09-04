import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLogService } from './audit-log.service';

@ApiTags('Audit Logs')
@Controller('workspaces/:workspaceId/audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List audit logs for a workspace' })
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.auditLogService.findAllForWorkspace(workspaceId);
  }
}