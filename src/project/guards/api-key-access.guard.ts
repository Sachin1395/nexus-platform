import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class ApiKeyAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // JWT authentication
    if (request.user) {
      return true;
    }

    // API-key authentication
    if (!request.project) {
      throw new ForbiddenException(
        'API key project not found.',
      );
    }

    const workspaceId = request.params.workspaceId;

    if (request.project.workspaceId !== workspaceId) {
      throw new ForbiddenException(
        'API key does not have access to this workspace.',
      );
    }

    const projectId = request.params.projectId;

    if (projectId && request.project.id !== projectId) {
      throw new ForbiddenException(
        'API key does not have access to this project.',
      );
    }

    return true;
  }
}