import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaService) {}

  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  hashKey(key: string) {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  async createApiKey(projectId: string, name: string) {
    const rawKey = this.generateKey();
    const keyHash = this.hashKey(rawKey);

    await this.prisma.apiKey.create({
      data: { name, keyHash, projectId },
    });

    return { key: rawKey }; // Return this only ONCE to the user
  }


  async revokeApiKey(projectId: string, apiKeyId: string) {
    // We verify the key belongs to the project before deleting
    return await this.prisma.apiKey.deleteMany({
      where: {
        id: apiKeyId,
        projectId: projectId,
      },
    });
  }

  async listApiKeys(projectId: string) {
    return await this.prisma.apiKey.findMany({
      where: { projectId },
      select: { 
        id: true, 
        name: true, 
        createdAt: true 
        // Note: Do NOT select keyHash here! Never expose the hash.
      },
    });
  }
}