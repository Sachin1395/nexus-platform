import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { firstValueFrom, isObservable } from 'rxjs';

import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyGuard } from './api-key.guard';

@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest();

    if (request.headers['x-api-key']) {
      const result =
        this.apiKeyGuard.canActivate(context);

      if (isObservable(result)) {
        return (await firstValueFrom(result)) as boolean;
      }

      return result;
    }

    const result =
      this.jwtAuthGuard.canActivate(context);

    if (isObservable(result)) {
      return (await firstValueFrom(result)) as boolean;
    }

    return result;
  }
}