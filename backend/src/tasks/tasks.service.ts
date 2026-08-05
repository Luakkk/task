import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksGateway } from './tasks.gateway';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: TasksGateway,
  ) {}

  findAllForUser(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const task = await this.prisma.task.create({
      data: { title: dto.title, description: dto.description, userId },
    });

    this.gateway.emitToUser(userId, 'task:created', {
      id: task.id,
      status: task.status,
      timestamp: task.updatedAt.toISOString(),
    });

    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto): Promise<Task> {
    await this.assertOwnership(userId, taskId);

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: dto,
    });

    this.gateway.emitToUser(userId, 'task:updated', {
      id: task.id,
      status: task.status,
      timestamp: task.updatedAt.toISOString(),
    });

    return task;
  }

  async remove(userId: string, taskId: string): Promise<void> {
    const task = await this.assertOwnership(userId, taskId);
    await this.prisma.task.delete({ where: { id: taskId } });

    this.gateway.emitToUser(userId, 'task:deleted', {
      id: task.id,
      status: task.status,
      timestamp: new Date().toISOString(),
    });
  }

  /** Loads the task and throws unless it belongs to userId. */
  private async assertOwnership(userId: string, taskId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.userId !== userId) {
      throw new ForbiddenException('This task does not belong to you');
    }
    return task;
  }
}
