
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Task, TaskDocument, TaskStatus } from './task.schema.js';
import { CreateTaskDto } from './create-task.dto.js';
import { UpdateTaskDto } from './update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    const task = await this.taskModel.create({
      title: dto.title.trim(),
      description: dto.description?.trim() ?? '',
      status: TaskStatus.TODO,
      userId,
    });

    return {
      message: 'Task created successfully.',
      task: {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        userId: task.userId,
        createdAt: task.createdAt,
      },
    };
  }




async findAllByUser(
  userId: string,
  page = 1,
  limit = 10,
  status?: TaskStatus,
  search?: string,
) {
  const skip = (page - 1) * limit;

  const filter: {
    userId: string;
    status?: TaskStatus;
    $or?: Array<Record<string, RegExp>>;
  } = { userId };

  if (status !== undefined) {
    filter.status = status;
  }

  const searchTerm = search?.trim();

  if (searchTerm) {
    // Escape regex special characters so search input is treated as plain text.
    const escapedSearch = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    const searchRegex = new RegExp(escapedSearch, 'i');

    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
    ];
  }

  const [tasks, total] = await Promise.all([
    this.taskModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),

    this.taskModel.countDocuments(filter).exec(),
  ]);

  return {
    message: 'Tasks retrieved successfully.',
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
    filters: {
      status: status ?? 'ALL',
      search: searchTerm ?? '',
    },
    tasks: tasks.map((task) => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })),
  };
}




  async updateByUser(
    userId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    const updates: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
    }> = {};

    if (dto.title !== undefined) {
      updates.title = dto.title.trim();
    }

    if (dto.description !== undefined) {
      updates.description = dto.description.trim();
    }

    if (dto.status !== undefined) {
      updates.status = dto.status;
    }

    const task = await this.taskModel
      .findOneAndUpdate(
        { _id: taskId, userId },
        { $set: updates },
        { new: true, runValidators: true },
      )
      .exec();

    if (!task) {
      return {
        status: 404,
        message: 'Task not found.',
      };
    }

    return {
      message: 'Task updated successfully.',
      task: {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        userId: task.userId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    };
  }




  async deleteByUser(userId: string, taskId: string) {
    const task = await this.taskModel
      .findOneAndDelete({
        _id: taskId,
        userId,
      })
      .exec();

    if (!task) {
      return {
        status: 404,
        message: 'Task not found.',
      };
    }

    return {
      message: 'Task deleted successfully.',
      task: {
        id: task._id.toString(),
        title: task.title,
        status: task.status,
      },
    };
  }

}
