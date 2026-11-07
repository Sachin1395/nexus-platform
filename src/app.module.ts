import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WorkspaceModule } from './workspace/workspace.module';
import { ProjectModule } from './project/project.module';
import { WorkspaceMembersModule } from './workspace-members/workspace-members.module';
import { CacheModule } from './cache/cache.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ResilientThrottlerStorage } from './cache/resilient-throttler.storage';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000,
            limit: 60,
          },
          {
            name: 'strict',
            ttl: 60000,
            limit: 10,
            // Opt-in: only routes that declare @Throttle({ strict }) use this.
            skipIf: (context) =>
              Reflect.getMetadata(
                'THROTTLER:LIMITstrict',
                context.getHandler(),
              ) === undefined,
          },
        ],

        storage: new ResilientThrottlerStorage(
          config.get<string>(
            'REDIS_URL',
            'redis://localhost:6379',
          ),
        ),
      }),
    }),
    PrismaModule,
    AuthModule,
    WorkspaceModule,
    ProjectModule,
    WorkspaceMembersModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
