import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

  app.enableCors({
    origin: ['http://localhost:5173', frontendUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port, '0.0.0.0');

  console.log(`T-LOG Backend ejecutándose en puerto ${port}`);
}

bootstrap().catch((error) => {
  console.error('Error iniciando T-LOG:', error);

  process.exit(1);
});
