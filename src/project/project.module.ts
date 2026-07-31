import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectGuard } from './guards/project.guard';

@Module({
  providers: [
    ProjectService,
    ProjectGuard,
],
  controllers: [ProjectController]
})
export class ProjectModule {}
