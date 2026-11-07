import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Throttle } from '@nestjs/throttler';

import { WorkspaceRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ThrottlerBehindApiKeyGuard } from '../auth/guards/throttler-behind-api-key.guard';

import { AuditInterceptor } from '../audit-log/interceptors/audit.interceptor';
import { Audit } from '../audit-log/decorators/audit.decorator';

import { WorkspaceService } from './workspace.service';

import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@ApiTags('Workspace')
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(
  JwtAuthGuard,
  ThrottlerBehindApiKeyGuard,
)
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
  ) {}

  // ============================================================
  // CREATE WORKSPACE
  // ============================================================

  @Post()
  @Throttle({
    strict: {
      limit: 10,
      ttl: 60000,
    },
  })
  @UseInterceptors(AuditInterceptor)
  @Audit('WORKSPACE_CREATED', 'WORKSPACE')
  @ApiOperation({
    summary: 'Create a new workspace',
  })
  @ApiResponse({
    status: 201,
    description: 'Workspace created successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'Workspace already exists.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests.',
  })
  async create(
    @Request() req,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.create(
      req.user.id,
      dto,
    );
  }

  // ============================================================
  // GET ALL USER WORKSPACES
  // ============================================================

  @Get()
  @Throttle({
    default: {
      limit: 60,
      ttl: 60000,
    },
  })
  @ApiOperation({
    summary: 'Get all workspaces of the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of workspaces.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests.',
  })
  async findAll(@Request() req) {
    return this.workspaceService.findAll(
      req.user.id,
    );
  }

  // ============================================================
  // GET WORKSPACE BY ID
  // ============================================================

  @Get(':id')
  @UseGuards(RolesGuard)
  @Throttle({
    default: {
      limit: 60,
      ttl: 60000,
    },
  })
  @Roles(
    WorkspaceRole.OWNER,
    WorkspaceRole.ADMIN,
    WorkspaceRole.DEVELOPER,
    WorkspaceRole.VIEWER,
  )
  @ApiOperation({
    summary: 'Get workspace by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace found.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests.',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ) {
    const workspace = await this.workspaceService.findOne(id);

    // RolesGuard has already loaded the caller's membership.
    return {
      ...workspace,
      role: req.membership.role,
    };
  }

  // ============================================================
  // UPDATE WORKSPACE
  // ============================================================

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Throttle({
    strict: {
      limit: 10,
      ttl: 60000,
    },
  })
  @UseInterceptors(AuditInterceptor)
  @Audit('WORKSPACE_UPDATED', 'WORKSPACE')
  @Roles(
    WorkspaceRole.OWNER,
    WorkspaceRole.ADMIN,
  )
  @ApiOperation({
    summary: 'Update workspace',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Workspace name already exists.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests.',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(
      id,
      dto,
    );
  }

  // ============================================================
  // DELETE WORKSPACE
  // ============================================================

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Throttle({
    strict: {
      limit: 5,
      ttl: 60000,
    },
  })
  @UseInterceptors(AuditInterceptor)
  @Audit('WORKSPACE_DELETED', 'WORKSPACE')
  @Roles(
    WorkspaceRole.OWNER,
  )
  @ApiOperation({
    summary: 'Delete workspace',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace deleted successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests.',
  })
  async remove(
    @Param('id') id: string,
  ) {
    return this.workspaceService.remove(id);
  }
}