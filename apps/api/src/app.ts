import 'reflect-metadata';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { OrderModule } from './modules/orders/order.module.js';
import { ProductModule } from './modules/products/product.module.js';
import { McpModule } from './engine/mcp/mcp.module.js';
import { HealthController } from './health.controller.js';
import { AppThrottlerGuard } from './platform/app-throttler.guard.js';
import type { AppConfig } from './platform/config.js';
import { AppExceptionFilter } from './platform/app-exception.filter.js';
import { PlatformModule } from './platform/platform.module.js';
import { registerSecurity } from './platform/security.js';

@Module({})
class AppModule {
  static forConfig(config: AppConfig) {
    const imports = [
      PlatformModule.forConfig(config),
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
      AuthModule,
      ProductModule,
      CartModule,
      OrderModule,
    ];
    if (config.mcpApiToken) {
      imports.push(McpModule);
    }
    return {
      module: AppModule,
      imports,
      controllers: [HealthController],
      providers: [{ provide: APP_GUARD, useClass: AppThrottlerGuard }],
    };
  }
}

export async function createApp(config: AppConfig): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule.forConfig(config), new FastifyAdapter());

  await registerSecurity(app);

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
