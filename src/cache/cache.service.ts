import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getOrSet<T>(
    key: string,
    ttl: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    try {
      const cached = await this.cacheManager.get<T>(key);

      if (cached) {
        this.logger.debug(`Cache Hit: ${key}`);
        return cached;
      }
    } catch (err) {
      if (err instanceof Error) {
        this.logger.warn(`Cache Read Failed: ${err.message}`);
      } else {
        this.logger.warn(`Cache Read Failed: ${String(err)}`);
      }
    }

    const data = await factory();

    try {
      await this.cacheManager.set(key, data, ttl);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.warn(`Cache Write Failed: ${err.message}`);
      } else {
        this.logger.warn(`Cache Write Failed: ${String(err)}`);
      }
    }

    return data;
  }

  async del(key: string) {
    try {
      await this.cacheManager.del(key);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.warn(`Cache Invalidation Failed: ${err.message}`);
      } else {
        this.logger.warn(`Cache Invalidation Failed: ${String(err)}`);
      }
    }
  }
}