
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:3000',
    'https://taskflow-microservices.vercel.app',
    'https://taskflow-microservices-frontend.vercel.app',
    process.env.FRONTEND_URL,
  ].filter((origin): origin is string => Boolean(origin));


  
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  });

  const port = Number(process.env.PORT ?? 3001);

  await app.listen(port, '0.0.0.0');

  console.log(`API Gateway listening on port ${port}`);
  console.log('Allowed frontend origins:', allowedOrigins);
}

await bootstrap();
