
import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

import { AppService } from './app.service.js';
import { TasksService } from './tasks/tasks.service.js';
import { CreateTaskDto } from './tasks/create-task.dto.js';
import { UpdateTaskDto } from './tasks/update-task.dto.js';
import { TaskStatus } from './tasks/task.schema.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly tasksService: TasksService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern({ cmd: 'task.ping' })
  pingTaskService() {
    return {
      service: 'task-service',
      status: 'connected',
      message: 'Hello from Task Service through RabbitMQ!',
    };
  }

  @MessagePattern({ cmd: 'task.create' })
  async createTask(
    @Payload()
    payload: { userId: string; dto: CreateTaskDto },
  ) {
    if (!payload?.userId || !payload?.dto) {
      throw new RpcException({
        status: 400,
        message: 'User and task details are required.',
      });
    }

    if (
      typeof payload.dto.title !== 'string' ||
      !payload.dto.title.trim() ||
      payload.dto.title.trim().length > 150
    ) {
      throw new RpcException({
        status: 400,
        message: 'Title is required and must be at most 150 characters.',
      });
    }

    if (
      payload.dto.description !== undefined &&
      (typeof payload.dto.description !== 'string' ||
        payload.dto.description.length > 2000)
    ) {
      throw new RpcException({
        status: 400,
        message: 'Description must be at most 2000 characters.',
      });
    }

    return this.tasksService.create(payload.userId, payload.dto);
  }





@MessagePattern({ cmd: 'task.findAll' })
async findAllTasks(
  @Payload()
  payload: {
    userId: string;
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  },
) {
  if (!payload?.userId) {
    throw new RpcException({
      status: 400,
      message: 'Authenticated user ID is required.',
    });
  }

  const page = Number(payload.page ?? 1);
  const limit = Number(payload.limit ?? 10);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new RpcException({
      status: 400,
      message: 'Page must be at least 1 and limit must be between 1 and 100.',
    });
  }

  let status: TaskStatus | undefined;

  if (payload.status !== undefined) {
    if (!Object.values(TaskStatus).includes(payload.status as TaskStatus)) {
      throw new RpcException({
        status: 400,
        message: 'Invalid status. Use TODO, IN_PROGRESS, or COMPLETED.',
      });
    }

    status = payload.status as TaskStatus;
  }

  if (
    payload.search !== undefined &&
    (typeof payload.search !== 'string' || payload.search.length > 100)
  ) {
    throw new RpcException({
      status: 400,
      message: 'Search must be a string of at most 100 characters.',
    });
  }

  return this.tasksService.findAllByUser(
    payload.userId,
    page,
    limit,
    status,
    payload.search,
  );
}





  @MessagePattern({ cmd: 'task.update' })
  async updateTask(
    @Payload()
    payload: {
      userId: string;
      taskId: string;
      dto: UpdateTaskDto;
    },
  ) {
    if (!payload?.userId || !payload?.taskId || !payload?.dto) {
      throw new RpcException({
        status: 400,
        message: 'User, task ID, and update details are required.',
      });
    }

    if (
      payload.dto.title !== undefined &&
      (typeof payload.dto.title !== 'string' ||
        !payload.dto.title.trim() ||
        payload.dto.title.trim().length > 150)
    ) {
      throw new RpcException({
        status: 400,
        message: 'Title must contain 1 to 150 characters.',
      });
    }

    if (
      payload.dto.description !== undefined &&
      (typeof payload.dto.description !== 'string' ||
        payload.dto.description.length > 2000)
    ) {
      throw new RpcException({
        status: 400,
        message: 'Description must be at most 2000 characters.',
      });
    }

    if (
      payload.dto.status !== undefined &&
      !Object.values(TaskStatus).includes(payload.dto.status)
    ) {
      throw new RpcException({
        status: 400,
        message: 'Invalid task status.',
      });
    }

    return this.tasksService.updateByUser(
      payload.userId,
      payload.taskId,
      payload.dto,
    );
  }



  @MessagePattern({ cmd: 'task.delete' })
  async deleteTask(
    @Payload()
    payload: {
      userId: string;
      taskId: string;
    },
  ) {
    if (!payload?.userId || !payload?.taskId) {
      throw new RpcException({
        status: 400,
        message: 'User ID and task ID are required.',
      });
    }

    return this.tasksService.deleteByUser(
      payload.userId,
      payload.taskId,
    );
  }

}
