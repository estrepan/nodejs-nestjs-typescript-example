import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule
    );
  const config: ConfigService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const options: DocumentBuilder = new DocumentBuilder()
    .setDescription('API')
    .setVersion('1.0')
    .addBearerAuth({ in: 'header', type: 'http' });

  SwaggerModule.setup(
    'api-docs',
    app,
    SwaggerModule.createDocument(app, options.build()),
  );

  await app.listen(config.get('port'));
}

void bootstrap();
