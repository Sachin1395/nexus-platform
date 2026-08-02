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

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceOwnerGuard } from '../workspace/guards/workspace-owner.guard';

import { WorkspaceMembersService } from './workspace-members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { WorkspaceMemberGuard } from 'src/workspace/guards/workspace-member.guard';

@ApiTags('Workspace Members')
@ApiBearerAuth()
@Controller('workspaces/:id/members')
@UseGuards(JwtAuthGuard)
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Post()
  @UseGuards(WorkspaceOwnerGuard)
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
  @UseGuards(WorkspaceMemberGuard)
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
  @UseGuards(WorkspaceOwnerGuard)
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