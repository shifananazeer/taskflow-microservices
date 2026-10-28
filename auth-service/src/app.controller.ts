
import { Controller, Get } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import { AppService } from './app.service.js';
import { UsersService } from './users/users.service.js';
import { RegisterDto } from './users/register.dto.js';
import { LoginDto } from './users/login.dto.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern({ cmd: 'auth.ping' })
  pingAuthService() {
    return {
      service: 'auth-service',
      status: 'connected',
      message: 'Hello from Auth Service through RabbitMQ!',
    };
  }

  @MessagePattern({ cmd: 'auth.register' })
  async registerUser(@Payload() dto: RegisterDto) {
    return this.usersService.register(dto);
  }

  @MessagePattern({ cmd: 'auth.login' })
  async loginUser(@Payload() dto: LoginDto) {
    return this.usersService.login(dto);
  }
}
