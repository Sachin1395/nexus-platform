import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { WorkspaceRole } from '../../generated/prisma/enums';

import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class WorkspaceMembersService {
  private readonly logger = new Logger(
    WorkspaceMembersService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async inviteMember(
    workspaceId: string,
    dto: AddMemberDto,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    const existingMember =
      await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: user.id,
          },
        },
      });

    if (existingMember) {
      throw new ConflictException(
        'User is already a member of this workspace.',
      );
    }

    const member =
      await this.prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId: user.id,
          role: dto.role,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

    this.logger.log(
      `User ${user.email} added to workspace ${workspaceId}`,
    );

    return {
      message: 'Member invited successfully.',
      member,
    };
  }

  async findAll(workspaceId: string) {
    const members =
      await this.prisma.workspaceMember.findMany({
        where: {
          workspaceId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          joinedAt: 'asc',
        },
      });

    this.logger.log(
      `Fetched ${members.length} members from workspace ${workspaceId}`,
    );

    return {
      count: members.length,
      members,
    };
  }

  async removeMember(
    workspaceId: string,
    memberId: string,
  ) {
    const member =
      await this.prisma.workspaceMember.findUnique({
        where: {
          id: memberId,
        },
      });

    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundException(
        'Workspace member not found.',
      );
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new ConflictException(
        'Workspace owner cannot be removed.',
      );
    }

    this.logger.log(
      `Removing member ${member.userId} from workspace ${workspaceId}`,
    );

    await this.prisma.workspaceMember.delete({
      where: {
        id: memberId,
      },
    });

    return {
      message: 'Member removed successfully.',
    };
  }
}