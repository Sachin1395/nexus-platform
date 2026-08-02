import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { WorkspaceRole } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const requiredRoles =
      this.reflector.getAllAndOverride<
        WorkspaceRole[]
      >(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredRoles) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const workspaceId =
      request.params.workspaceId ??
      request.params.id;

    if (!request.user) {
      throw new ForbiddenException(
        'User not authenticated.',
      );
    }

    const userId = request.user.id;

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

    request.membership = membership;

    return requiredRoles.includes(
      membership.role,
    );
  }
}