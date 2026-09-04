import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
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
import { ApiKeyService } from './api-key.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

import { AuditInterceptor } from '../audit-log/interceptors/audit.interceptor';
import { Audit } from '../audit-log/decorators/audit.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly apiKeyService: ApiKeyService,
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
  @UseInterceptors(AuditInterceptor)
  @Audit('PROJECT_CREATED', 'PROJECT')
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
  }) @UseInterceptors(AuditInterceptor)
  @Audit('PROJECT_UPDATED', 'PROJECT')
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
  @UseInterceptors(AuditInterceptor)
  @Audit('PROJECT_DELETED', 'PROJECT')
  remove(
    @Req() req: Request & { project: any },
  ) {
    return this.projectService.remove(
      req.project.id,
    );
  }


  @Post(':projectId/api-keys')
  @UseGuards(RolesGuard, ProjectGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
  })
  @ApiOperation({ summary: 'Generate a new API key for a project' })
  @UseInterceptors(AuditInterceptor)
  @Audit('API_KEY_CREATED', 'API_KEY')
  async createApiKey(
    @Param('projectId') projectId: string,
    @Body('name') name: string, // Expecting a name for the key in the body
  ) {
    return this.apiKeyService.createApiKey(projectId, name || 'Default Key');
  }

  // Add this inside ProjectController

  @Get(':projectId/api-keys')
  @UseGuards(RolesGuard, ProjectGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
  })

  @ApiOperation({ summary: 'List all API keys for a project' })
  async listApiKeys(@Param('projectId') projectId: string) {
    return this.apiKeyService.listApiKeys(projectId);
  }

  @Delete(':projectId/api-keys/:apiKeyId')
  @UseGuards(RolesGuard, ProjectGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
  })
  @ApiParam({
    name: 'apiKeyId',
    description: 'API Key ID',
  })
  @ApiOperation({ summary: 'Revoke an API key' })
  @UseInterceptors(AuditInterceptor)
  @Audit('API_KEY_REVOKED', 'API_KEY')
  async revokeApiKey(
    @Param('projectId') projectId: string,
    @Param('apiKeyId') apiKeyId: string,
  ) {
    const result = await this.apiKeyService.revokeApiKey(projectId, apiKeyId);

    if (result.count === 0) {
      throw new NotFoundException('API Key not found for this project');
    }

    return { message: 'API Key revoked successfully' };
  }
}