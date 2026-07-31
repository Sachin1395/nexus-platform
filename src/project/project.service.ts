import {
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    workspaceId: string,
    dto: CreateProjectDto,
  ) {
    const existingProject =
      await this.prisma.project.findUnique({
        where: {
          workspaceId_name: {
            workspaceId,
            name: dto.name,
          },
        },
      });

    if (existingProject) {
      throw new ConflictException(
        'Project with this name already exists.',
      );
    }

    const project =
      await this.prisma.project.create({
        data: {
          name: dto.name,
          description: dto.description,
          workspaceId,
        },
      });

    this.logger.log(
      `Project ${project.id} created in workspace ${workspaceId}`,
    );

    return project;
  }

  async findAll(workspaceId: string) {
    return this.prisma.project.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    projectId: string,
    dto: UpdateProjectDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    // Check duplicate name only if the name is changing
    if (dto.name && dto.name !== project?.name) {
      const existingProject =
        await this.prisma.project.findUnique({
          where: {
            workspaceId_name: {
              workspaceId: project!.workspaceId,
              name: dto.name,
            },
          },
        });

      if (existingProject) {
        throw new ConflictException(
          'Project with this name already exists.',
        );
      }
    }

    return this.prisma.project.update({
      where: {
        id: projectId,
      },
      data: dto,
    });
  }

  async remove(projectId: string) {
    await this.prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    this.logger.log(
      `Project ${projectId} deleted.`,
    );

    return {
      message: 'Project deleted successfully.',
    };
  }
}