import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from 'modules';
import { getConnectionOptions, createConnection } from 'typeorm';
import path from 'path';

async function bootstrap() {
  const options = await getConnectionOptions();
  await createConnection({
    ...options,
    entities: [
      path.join(__dirname, './entities/*.js'),
      path.join(__dirname, './entities/**/*.js'),
    ],
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(parseInt(process.env.APP_PORT), '0.0.0.0');
}

bootstrap().catch(console.error);
