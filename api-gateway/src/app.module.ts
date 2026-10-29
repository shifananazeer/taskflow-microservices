
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

const rabbitMQUrl =
  process.env.RABBITMQ_URL ||
  'amqp://taskflow:taskflow_dev_password@localhost:5672';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),

    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rabbitMQUrl],
          queue: 'auth_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'TASK_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rabbitMQUrl],
          queue: 'task_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
