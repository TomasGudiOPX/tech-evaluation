import 'reflect-metadata';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthModule } from './modules/auth/auth.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { OrderModule } from './modules/orders/order.module.js';
import { ProductModule } from './modules/products/product.module.js';
import { HealthController } from './health.controller.js';
import type { AppConfig } from './platform/config.js';
import { AppExceptionFilter } from './platform/app-exception.filter.js';
import { PlatformModule } from './platform/platform.module.js';

@Module({})
class AppModule {
  static forConfig(config: AppConfig) {
    return {
      module: AppModule,
      imports: [PlatformModule.forConfig(config), AuthModule, ProductModule, CartModule, OrderModule],
      controllers: [HealthController],
    };
  }
}

export async function createApp(config: AppConfig): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule.forConfig(config), new FastifyAdapter());

  app.enableCors({ origin: config.corsOrigin });
  app.useGlobalFilters(new AppExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Shopping Cart API')
    .setDescription('REST API for catalog, authentication, cart, checkout, orders, and product administration.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  return app;
}
