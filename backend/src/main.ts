import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ============================================================
  // CORS
  // ============================================================

  const frontendUrl =
    process.env.FRONTEND_URL ?? 'http://localhost:5173';

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://t-log.vercel.app',
      frontendUrl,
    ],

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  });

  // ============================================================
  // SWAGGER
  // ============================================================

  const swaggerConfig = new DocumentBuilder()
    .setTitle('T-LOG API')
    .setDescription('API del sistema T-LOG - Logística y RR.HH.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup('api', app, swaggerDocument);

  // ============================================================
  // PUERTO
  // ============================================================

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port, '0.0.0.0');

  console.log(
    `T-LOG Backend ejecutándose en puerto ${port}`,
  );

  console.log(
    `Swagger disponible en http://localhost:${port}/api`,
  );
}

bootstrap().catch((error) => {
  console.error('Error iniciando T-LOG:', error);

  process.exit(1);
});
