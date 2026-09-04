import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          url: 'redis://localhost:6379',
          ttl: 60000,
        }),
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}