import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from '../audit-log.service';
import { AUDIT_ACTION_KEY, AUDIT_RESOURCE_KEY } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        private readonly auditLogService: AuditLogService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const action = this.reflector.get<string>(AUDIT_ACTION_KEY, context.getHandler());
        const resourceType = this.reflector.get<string>(AUDIT_RESOURCE_KEY, context.getHandler());

        // No @Audit() on this route -> do nothing, just pass through.
        if (!action || !resourceType) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const userId: string | undefined = request.user?.id;

        return next.handle().pipe(
            tap((responseBody) => {
                const resourceId =
                    responseBody?.id ??
                    request.params?.apiKeyId ??
                    request.params?.projectId ??
                    request.params?.id;

                const workspaceId =
                    request.params?.workspaceId ??
                    request.body?.workspaceId ??
                    (resourceType === 'WORKSPACE' ? resourceId : undefined);

                this.auditLogService.record({
                    action,
                    resourceType,
                    resourceId,
                    userId,
                    workspaceId,
                    metadata: {
                        method: request.method,
                        path: request.route?.path,
                    },
                });
            }),
        );
    }
}