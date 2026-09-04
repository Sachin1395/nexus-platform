import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface RecordAuditLogParams {
  action: string;
  resourceType: string;
  resourceId?: string;
  userId?: string;
  workspaceId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(params: RecordAuditLogParams) {
  try {
    await this.prisma.auditLog.create({
      data: {
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        userId: params.userId,
        workspaceId: params.workspaceId,
        metadata: params.metadata as any,
      },
    });
  } catch (err) {
    // Audit logging must never break the actual request.
    if (err instanceof Error) {
      this.logger.error(
        `Failed to write audit log: ${err.message}`,
        err.stack,
      );
    } else {
      this.logger.error(
        `Failed to write audit log: ${String(err)}`,
      );
    }
  }
}

  async findAllForWorkspace(workspaceId: string, take = 50, skip = 0) {
    return this.prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }
}