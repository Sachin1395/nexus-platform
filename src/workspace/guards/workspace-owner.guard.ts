import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceOwnerGuard implements CanActivate {
  private readonly logger = new Logger(WorkspaceOwnerGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    const workspaceId = request.params.id;

    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== user.id) {
      this.logger.warn(
        `User ${user.id} tried to access workspace ${workspaceId}`,
      );

      throw new ForbiddenException(
        'You do not own this workspace',
      );
    }

    request.workspace = workspace;

    return true;
  }
}