import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceOwnerGuard } from '../workspace/guards/workspace-owner.guard';

import { ProjectGuard } from './guards/project.guard';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
  ) {}

  @Post()
  @UseGuards(WorkspaceOwnerGuard)
  @ApiOperation({
    summary: 'Create a new project',
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully.',
  })
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.create(
      workspaceId,
      dto,
    );
  }

  @Get()
  @UseGuards(WorkspaceOwnerGuard)
  @ApiOperation({
    summary: 'Get all projects in a workspace',
  })
  findAll(
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.projectService.findAll(workspaceId);
  }

  @Get(':projectId')
  @UseGuards(
    WorkspaceOwnerGuard,
    ProjectGuard,
  )
  @ApiOperation({
    summary: 'Get a project by ID',
  })
  findOne(
    @Req() req: Request & { project: any },
  ) {
    return req.project;
  }

  @Patch(':projectId')
  @UseGuards(
    WorkspaceOwnerGuard,
    ProjectGuard,
  )
  @ApiOperation({
    summary: 'Update a project',
  })
  update(
    @Req() req: Request & { project: any },
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(
      req.project.id,
      dto,
    );
  }

  @Delete(':projectId')
  @UseGuards(
    WorkspaceOwnerGuard,
    ProjectGuard,
  )
  @ApiOperation({
    summary: 'Delete a project',
  })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully.',
  })
  remove(
    @Req() req: Request & { project: any },
  ) {
    return this.projectService.remove(
      req.project.id,
    );
  }
}