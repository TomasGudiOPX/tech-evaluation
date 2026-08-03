import 'reflect-metadata';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthController } from './health.controller.js';
import type { AppConfig } from './platform/config.js';
import { AppExceptionFilter } from './platform/app-exception.filter.js';
import { PlatformModule } from './platform/platform.module.js';

@Module({})
class AppModule {
  static forConfig(config: AppConfig) {
    return {
      module: AppModule,
      imports: [PlatformModule.forConfig(config), AuthModule],
      controllers: [HealthController],
    };
  }
}

export async function createApp(config: AppConfig): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule.forConfig(config), new FastifyAdapter(), {
    logger: true,
  });

  app.enableCors({ origin: config.corsOrigin });
  app.useGlobalFilters(new AppExceptionFilter());

  return app;
}
