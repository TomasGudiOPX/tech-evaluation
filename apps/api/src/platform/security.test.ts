import { Controller, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { ThrottlerModule } from '@nestjs/throttler';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppExceptionFilter } from './app-exception.filter.js';
import { AppThrottlerGuard } from './app-throttler.guard.js';
import { registerSecurity } from './security.js';

@Controller()
class HealthController {
  @Get('/health')
  health() {
    return { ok: true };
  }
}

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 3 }])],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: AppThrottlerGuard }],
})
class SecurityTestModule {}

describe('registerSecurity and rate limiting', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await NestFactory.create<NestFastifyApplication>(SecurityTestModule, new FastifyAdapter());
    await registerSecurity(app);
    app.useGlobalFilters(new AppExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('adds security headers and rejects over-limit traffic with a structured 429', async () => {
    const fastify = app.getHttpAdapter().getInstance();

    for (let index = 0; index < 3; index += 1) {
      const response = await fastify.inject({ method: 'GET', url: '/health' });
      expect(response.statusCode).toBe(200);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    }

    const limited = await fastify.inject({ method: 'GET', url: '/health' });

    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toEqual({
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later.',
    });
  });
});
