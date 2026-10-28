
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {

    instrument: ObserveInstrument,
  });

 app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });


  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  console.log(`API Gateway running on http://localhost:${port}`);
}

await bootstrap();
