
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        'amqp://taskflow:taskflow_dev_password@localhost:5672',
      ],
      queue: 'task_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = Number(process.env.PORT ?? 3003);
  await app.listen(port);

  console.log(`Task Service HTTP: http://localhost:${port}`);
  console.log('Task Service connected to RabbitMQ queue: task_queue');
}

await bootstrap();
