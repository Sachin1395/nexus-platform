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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { WorkspaceRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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
  ) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(
    WorkspaceRole.OWNER,
    WorkspaceRole.ADMIN,
  )
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
  @UseGuards(RolesGuard)
  @Roles(
    WorkspaceRole.OWNER,
    WorkspaceRole.ADMIN,
    WorkspaceRole.DEVELOPER,
    WorkspaceRole.VIEWER,
  )
  @ApiOperation({
    summary: 'Get all projects in a workspace',
  })
  findAll(
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.projectService.findAll(workspaceId);
  }

  @Get(':projectId')
  @UseGuards(RolesGuard, ProjectGuard)
  @Roles(
    WorkspaceRole.OWNER,
    WorkspaceRole.ADMIN,
    WorkspaceRole.DEVELOPER,
    WorkspaceRole.VIEWER,
  )
  @ApiOperation({
    summary: 'Get a project by ID',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
  })
  findOne(
    @Req() req: Request & { project: any },
  ) {
    return req.project;
  }

  @Patch(':projectId')
  @UseGuards(
    RolesGuard,
    ProjectGuard,
  )
  @Roles(
    WorkspaceRole.OWNER,
    WorkspaceRole.ADMIN,
    WorkspaceRole.DEVELOPER,
  )
  @ApiOperation({
    summary: 'Update a project',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found.',
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
    RolesGuard,
    ProjectGuard,
  )
  @Roles(
    WorkspaceRole.OWNER,
  )
  @ApiOperation({
    summary: 'Delete a project',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found.',
  })
  remove(
    @Req() req: Request & { project: any },
  ) {
    return this.projectService.remove(
      req.project.id,
    );
  }
}