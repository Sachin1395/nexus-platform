import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) throw new UnauthorizedException('API Key missing');

    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    const keyRecord = await this.prisma.apiKey.findUnique({
      where: { keyHash: hashedKey },
      include: { project: true }
    });

    if (!keyRecord) throw new UnauthorizedException('Invalid API Key');

    // Attach the project to the request object so you can use it in your controller
    request.project = keyRecord.project;
    return true;
  }
}