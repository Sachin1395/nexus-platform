import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const workspaceId = request.params.workspaceId;
    const projectId = request.params.projectId;

    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found.',
      );
    }

    if (project.workspaceId !== workspaceId) {
      throw new ForbiddenException(
        'You do not have access to this project.',
      );
    }

    request.project = project;

    return true;
  }
}