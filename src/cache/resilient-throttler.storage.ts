import { Logger, OnModuleDestroy } from '@nestjs/common';
import { ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';

// Uses Redis when it is reachable and falls back to per-process counters when
// it is not, so a Redis outage never takes the API down with it.
export class ResilientThrottlerStorage
  implements ThrottlerStorage, OnModuleDestroy
{
  private readonly logger = new Logger(ResilientThrottlerStorage.name);
  private readonly memory = new ThrottlerStorageService();
  private readonly client: Redis;
  private readonly redis: ThrottlerStorageRedisService;
  private usingMemory = false;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (attempt) => Math.min(attempt * 500, 10000),
    });

    this.client.on('ready', () => {
      this.usingMemory = false;
      this.logger.log('Rate limiting is using Redis.');
    });

    this.client.on('error', () => this.fallBack());

    this.redis = new ThrottlerStorageRedisService(this.client);
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ) {
    if (this.client.status === 'ready') {
      try {
        return await this.redis.increment(
          key,
          ttl,
          limit,
          blockDuration,
          throttlerName,
        );
      } catch {
        this.fallBack();
      }
    }

    return this.memory.increment(
      key,
      ttl,
      limit,
      blockDuration,
      throttlerName,
    );
  }

  onModuleDestroy() {
    this.client.disconnect();
    this.memory.onApplicationShutdown();
  }

  private fallBack() {
    if (!this.usingMemory) {
      this.usingMemory = true;
      this.logger.warn(
        'Redis is unavailable. Rate limiting is using in-memory counters.',
      );
    }
  }
}
