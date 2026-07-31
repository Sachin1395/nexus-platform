import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceRole } from '../../generated/prisma/enums';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const slug = this.generateSlug(dto.name);

    const existingWorkspace = await this.prisma.workspace.findUnique({
      where: {
        slug,
      },
    });

    if (existingWorkspace) {
      throw new ConflictException(
        'Workspace with this name already exists.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const createdWorkspace = await tx.workspace.create({
        data: {
          name: dto.name,
          description: dto.description,
          slug,
          ownerId: userId,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: createdWorkspace.id,
          userId,
          role: WorkspaceRole.OWNER,
        },
      });

      return createdWorkspace;
    });
  }

  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    dto: UpdateWorkspaceDto,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    let slug = workspace.slug;

    if (dto.name && dto.name !== workspace.name) {
      slug = this.generateSlug(dto.name);

      const existing = await this.prisma.workspace.findUnique({
        where: {
          slug,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Workspace name already exists.',
        );
      }
    }

    return this.prisma.workspace.update({
      where: {
        id,
      },
      data: {
        ...dto,
        slug,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.workspace.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Workspace deleted successfully.',
    };
  }

  private generateSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}