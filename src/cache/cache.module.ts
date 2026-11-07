import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    // In-memory cache. CacheService passes its own TTL on every write.
    NestCacheModule.register({
      ttl: 60000,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}