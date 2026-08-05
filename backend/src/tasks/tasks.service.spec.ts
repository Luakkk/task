import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksGateway } from './tasks.gateway';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    task: { findMany: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock; findUnique: jest.Mock };
  };
  let gateway: { emitToUser: jest.Mock };

  const USER_A = 'user-a';
  const USER_B = 'user-b';

  beforeEach(() => {
    prisma = {
      task: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    gateway = { emitToUser: jest.fn() };
    service = new TasksService(prisma as unknown as PrismaService, gateway as unknown as TasksGateway);
  });

  it('lists only the tasks belonging to the requesting user', async () => {
    prisma.task.findMany.mockResolvedValue([{ id: 't1', userId: USER_A }]);

    const result = await service.findAllForUser(USER_A);

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER_A } }),
    );
    expect(result).toEqual([{ id: 't1', userId: USER_A }]);
  });

  it('creates a task and broadcasts task:created to its owner', async () => {
    const created = {
      id: 't1',
      title: 'Write tests',
      status: 'TODO',
      userId: USER_A,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    prisma.task.create.mockResolvedValue(created);

    const result = await service.create(USER_A, { title: 'Write tests' });

    expect(result).toEqual(created);
    expect(gateway.emitToUser).toHaveBeenCalledWith(USER_A, 'task:created', {
      id: 't1',
      status: 'TODO',
      timestamp: '2026-01-01T00:00:00.000Z',
    });
  });

  it('throws NotFoundException when updating a task that does not exist', async () => {
    prisma.task.findUnique.mockResolvedValue(null);

    await expect(service.update(USER_A, 'missing', { status: 'DONE' as any })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when updating another user\'s task', async () => {
    prisma.task.findUnique.mockResolvedValue({ id: 't1', userId: USER_B });

    await expect(service.update(USER_A, 't1', { status: 'DONE' as any })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it('updates a task and broadcasts task:updated with the new status', async () => {
    prisma.task.findUnique.mockResolvedValue({ id: 't1', userId: USER_A });
    const updated = {
      id: 't1',
      status: 'IN_PROGRESS',
      userId: USER_A,
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };
    prisma.task.update.mockResolvedValue(updated);

    const result = await service.update(USER_A, 't1', { status: 'IN_PROGRESS' as any });

    expect(result).toEqual(updated);
    expect(gateway.emitToUser).toHaveBeenCalledWith(USER_A, 'task:updated', {
      id: 't1',
      status: 'IN_PROGRESS',
      timestamp: '2026-01-02T00:00:00.000Z',
    });
  });

  it('deletes a task and broadcasts task:deleted', async () => {
    prisma.task.findUnique.mockResolvedValue({ id: 't1', userId: USER_A, status: 'DONE' });
    prisma.task.delete.mockResolvedValue({});

    await service.remove(USER_A, 't1');

    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
    expect(gateway.emitToUser).toHaveBeenCalledWith(
      USER_A,
      'task:deleted',
      expect.objectContaining({ id: 't1', status: 'DONE' }),
    );
  });
});
