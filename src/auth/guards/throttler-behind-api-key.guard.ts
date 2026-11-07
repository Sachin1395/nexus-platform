import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindApiKeyGuard extends ThrottlerGuard {
  protected async getTracker(
    req: Record<string, any>,
  ): Promise<string> {
    // Machine-to-machine authentication
    if (req.apiKey?.id) {
      return `apikey:${req.apiKey.id}`;
    }

    // JWT authentication
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }

    // Unauthenticated requests
    return `ip:${req.ip}`;
  }
}