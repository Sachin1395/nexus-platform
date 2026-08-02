import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
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

import { WorkspaceMembersService } from './workspace-members.service';
import { AddMemberDto } from './dto/add-member.dto';

@ApiTags('Workspace Members')
@ApiBearerAuth()
@Controller('workspaces/:id/members')
@UseGuards(JwtAuthGuard)
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(
    WorkspaceRole.OWNER,
    WorkspaceRole.ADMIN,
  )
  @ApiOperation({
    summary: 'Invite a member to the workspace',
  })
  @ApiParam({
    name: 'id',
    description: 'Workspace ID',
  })
  @ApiResponse({
    status: 201,
    description: 'Member added successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'User is already a member.',
  })
  async invite(
    @Param('id') workspaceId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.workspaceMembersService.inviteMember(
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
    summary: 'Get workspace members',
  })
  @ApiParam({
    name: 'id',
    description: 'Workspace ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace members fetched successfully.',
  })
  async findAll(
    @Param('id') workspaceId: string,
  ) {
    return this.workspaceMembersService.findAll(
      workspaceId,
    );
  }

  @Delete(':memberId')
  @UseGuards(RolesGuard)
  @Roles(WorkspaceRole.OWNER)
  @ApiOperation({
    summary: 'Remove a workspace member',
  })
  @ApiParam({
    name: 'id',
    description: 'Workspace ID',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Workspace Member ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Member removed successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found.',
  })
  async remove(
    @Param('id') workspaceId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.workspaceMembersService.removeMember(
      workspaceId,
      memberId,
    );
  }
}