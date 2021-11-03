import * as dotenv from 'dotenv';
dotenv.config();
import * as core from 'express-serve-static-core';
import { HttpsFunction, https, region as FunctionRegion } from 'firebase-functions';
import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { AuthModule } from './src/modules';
import * as triggers from './src/triggers';

const expressServer: core.Express = express();
const region: string = process.env.FIREBASE_REGION || 'us-central1';

async function createFunction(name: string, module: any): Promise<INestApplication> {
  const app: INestApplication = await NestFactory.create(module, new ExpressAdapter(expressServer));

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const options: DocumentBuilder = new DocumentBuilder()
    .addServer(`${process.env.SWAGGER_SERVER_URL}/${name}`)
    .setDescription('API')
    .setVersion('1.0')
    .addBearerAuth({ in: 'header', type: 'http' });

  SwaggerModule.setup('api-docs', app, SwaggerModule.createDocument(app, options.build()));

  return app.init();
}

export const auth: HttpsFunction = FunctionRegion(region).https.onRequest(async (request: https.Request, response: express.Response) => {
  await createFunction('auth', AuthModule);
  expressServer(request, response);
});

export const firestoreTriggers: any = { ...triggers };
