import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspaceOwnerGuard } from './guards/workspace-owner.guard';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService,WorkspaceOwnerGuard,],
})
export class WorkspaceModule {}