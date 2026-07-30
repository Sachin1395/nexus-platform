import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Workspace')
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiResponse({
    status: 201,
    description: 'Workspace created successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'Workspace already exists.',
  })
  async create(
    @Request() req,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces of the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of workspaces',
  })
  async findAll(@Request() req) {
    return this.workspaceService.findAll(req.user.id);
  }



  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  @ApiResponse({
    status: 200,
    description: 'Workspace found',
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.workspaceService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update workspace',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Workspace updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @Request() req,
  ) {
    return this.workspaceService.update(
      id,
      req.user.id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete workspace',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Workspace deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace not found.',
  })
  async remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.workspaceService.remove(
      id,
      req.user.id,
    );
  }
}