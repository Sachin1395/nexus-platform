import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { WorkspaceModule } from './workspace/workspace.module';
import { ProjectModule } from './project/project.module';
import { WorkspaceMembersModule } from './workspace-members/workspace-members.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
export class AppModule {}
