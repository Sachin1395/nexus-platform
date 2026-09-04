import {
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
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

    // New project means the cached list is stale — invalidate it
    await this.cacheService.del(`projects_list:${workspaceId}`);

    this.logger.log(
      `Project ${project.id} created in workspace ${workspaceId}`,
    );

    return project;
  }

  async findAll(workspaceId: string) {
    return this.cacheService.getOrSet(
      `projects_list:${workspaceId}`,
      30000, // 30s TTL
      () =>
        this.prisma.project.findMany({
          where: {
            workspaceId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
    );
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

    const updated = await this.prisma.project.update({
      where: {
        id: projectId,
      },
      data: dto,
    });

    // Data changed — evict the stale cached list
    await this.cacheService.del(`projects_list:${updated.workspaceId}`);

    return updated;
  }

  async remove(projectId: string) {
    const deleted = await this.prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    // Prisma's delete() returns the deleted row, so we get workspaceId for free
    await this.cacheService.del(`projects_list:${deleted.workspaceId}`);

    this.logger.log(
      `Project ${projectId} deleted.`,
    );

    return {
      message: 'Project deleted successfully.',
    };
  }
}