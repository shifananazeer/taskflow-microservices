
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RABBITMQ_URL ||
          'amqp://taskflow:taskflow_dev_password@localhost:5672',
      ],
      queue: 'auth_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port, '0.0.0.0');

  console.log(`Auth Service HTTP listening on port ${port}`);
  console.log('Auth Service connected to RabbitMQ queue: auth_queue');
}

await bootstrap();
