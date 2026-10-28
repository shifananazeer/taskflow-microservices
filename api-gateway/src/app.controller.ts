
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Inject,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { Request } from 'express';
import {
  firstValueFrom,
  timeout,
  catchError,
  throwError,
} from 'rxjs';

import { JwtAuthGuard } from './auth/jwt-auth.guard.js';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,

    @Inject('TASK_SERVICE')
    private readonly taskClient: ClientProxy,
  ) {}

  @Get('auth/ping')
  async pingAuthService() {
    return firstValueFrom(
      this.authClient.send({ cmd: 'auth.ping' }, {}),
    );
  }

  @Get('tasks/ping')
  async pingTaskService() {
    return firstValueFrom(
      this.taskClient.send({ cmd: 'task.ping' }, {}),
    );
  }

  @Post('auth/register')
  async register(
    @Body() body: {
      name: string;
      email: string;
      password: string;
    },
  ) {
    try {
      return await firstValueFrom(
        this.authClient.send({ cmd: 'auth.register' }, body).pipe(
          timeout(10000),
          catchError((error) =>
            throwError(
              () =>
                new HttpException(
                  error?.message || 'Auth Service request failed.',
                  error?.status || HttpStatus.BAD_GATEWAY,
                ),
            ),
          ),
        ),
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Unable to process registration.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Post('auth/login')
  async login(
    @Body() body: { email: string; password: string },
  ) {
    try {
      return await firstValueFrom(
        this.authClient.send({ cmd: 'auth.login' }, body).pipe(
          timeout(10000),
          catchError((error) =>
            throwError(
              () =>
                new HttpException(
                  error?.message || 'Auth Service request failed.',
                  error?.status || HttpStatus.BAD_GATEWAY,
                ),
            ),
          ),
        ),
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Unable to process login.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/profile')
  getProfile(@Req() request: AuthenticatedRequest) {
    return {
      message: 'Authenticated successfully.',
      user: {
        id: request.user.sub,
        email: request.user.email,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('tasks')
  async createTask(
    @Req() request: AuthenticatedRequest,
    @Body() body: { title: string; description?: string },
  ) {
    try {
      return await firstValueFrom(
        this.taskClient
          .send(
            { cmd: 'task.create' },
            {
              userId: request.user.sub,
              dto: body,
            },
          )
          .pipe(
            timeout(10000),
            catchError((error) =>
              throwError(
                () =>
                  new HttpException(
                    error?.message || 'Task Service request failed.',
                    error?.status || HttpStatus.BAD_GATEWAY,
                  ),
              ),
            ),
          ),
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Unable to create task.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }





@UseGuards(JwtAuthGuard)
@Get('tasks')
async getMyTasks(
  @Req() request: AuthenticatedRequest,
  @Query('page') pageValue?: string,
  @Query('limit') limitValue?: string,
  @Query('status') statusValue?: string,
  @Query('search') searchValue?: string,
) {
  const page = pageValue === undefined ? 1 : Number(pageValue);
  const limit = limitValue === undefined ? 10 : Number(limitValue);
  const status = statusValue?.trim().toUpperCase();
  const search = searchValue?.trim();

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new HttpException(
      'Page must be at least 1 and limit must be between 1 and 100.',
      HttpStatus.BAD_REQUEST,
    );
  }

  const allowedStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

  if (status !== undefined && !allowedStatuses.includes(status)) {
    throw new HttpException(
      'Invalid status. Use TODO, IN_PROGRESS, or COMPLETED.',
      HttpStatus.BAD_REQUEST,
    );
  }

  if (search !== undefined && search.length > 100) {
    throw new HttpException(
      'Search must be at most 100 characters.',
      HttpStatus.BAD_REQUEST,
    );
  }

  try {
    return await firstValueFrom(
      this.taskClient
        .send(
          { cmd: 'task.findAll' },
          {
            userId: request.user.sub,
            page,
            limit,
            ...(status ? { status } : {}),
            ...(search ? { search } : {}),
          },
        )
        .pipe(
          timeout(10000),
          catchError((error) =>
            throwError(
              () =>
                new HttpException(
                  error?.message || 'Task Service request failed.',
                  error?.status || HttpStatus.BAD_GATEWAY,
                ),
            ),
          ),
        ),
    );
  } catch (error: unknown) {
    if (error instanceof HttpException) throw error;

    throw new HttpException(
      'Unable to retrieve tasks.',
      HttpStatus.BAD_GATEWAY,
    );
  }
}



  @UseGuards(JwtAuthGuard)
  @Patch('tasks/:id')
  async updateTask(
    @Req() request: AuthenticatedRequest,
    @Param('id') taskId: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
    },
  ) {
    try {
      const result = await firstValueFrom(
        this.taskClient
          .send(
            { cmd: 'task.update' },
            {
              userId: request.user.sub,
              taskId,
              dto: body,
            },
          )
          .pipe(
            timeout(10000),
            catchError((error) =>
              throwError(
                () =>
                  new HttpException(
                    error?.message || 'Task Service request failed.',
                    error?.status || HttpStatus.BAD_GATEWAY,
                  ),
              ),
            ),
          ),
      );

      if (result?.status === 404) {
        throw new HttpException(
          result.message,
          HttpStatus.NOT_FOUND,
        );
      }

      return result;
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Unable to update task.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }


  @UseGuards(JwtAuthGuard)
  @Delete('tasks/:id')
  async deleteTask(
    @Req() request: AuthenticatedRequest,
    @Param('id') taskId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.taskClient
          .send(
            { cmd: 'task.delete' },
            {
              userId: request.user.sub,
              taskId,
            },
          )
          .pipe(
            timeout(10000),
            catchError((error) =>
              throwError(
                () =>
                  new HttpException(
                    error?.message || 'Task Service request failed.',
                    error?.status || HttpStatus.BAD_GATEWAY,
                  ),
              ),
            ),
          ),
      );

      if (result?.status === 404) {
        throw new HttpException(
          result.message,
          HttpStatus.NOT_FOUND,
        );
      }

      return result;
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Unable to delete task.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }


}
