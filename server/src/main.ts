import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      process.env.CLIENT_URL || '',
      'https://projet-blobby.vercel.app',
      'http://localhost:5173',
    ],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Blobby server running on port ${port}`);
}

bootstrap();
