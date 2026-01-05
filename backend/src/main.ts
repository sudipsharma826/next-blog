import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 5000;
  const localUrl = configService.get<string>('LOCAL_URL');
  const productionUrl = configService.get<string>('PRODUCTION_URL');

  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: [localUrl, productionUrl],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // to get cookies from request object
  app.use(cookieParser());

  // to handle the global error
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(port);
}
void bootstrap();
