import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectGuard } from './guards/project.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule,],
  providers: [
    ProjectService,
    ProjectGuard,
],
  controllers: [ProjectController]
})
export class ProjectModule {}
