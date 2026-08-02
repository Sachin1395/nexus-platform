import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest();

    const workspaceId = request.params.id;
    const userId = request.user.id;

    const workspace =
      await this.prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
      });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found.',
      );
    }

    const membership =
      await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this workspace.',
      );
    }

    request.workspace = workspace;
    request.membership = membership;

    return true;
  }
}