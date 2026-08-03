import { DynamicModule, Global, Module } from '@nestjs/common';
import type { AppConfig } from './config.js';
import { APP_CONFIG } from './app-config.token.js';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({})
export class PlatformModule {
  static forConfig(config: AppConfig): DynamicModule {
    return {
      module: PlatformModule,
      providers: [
        { provide: APP_CONFIG, useValue: config },
        {
          provide: PrismaService,
          useFactory: () => new PrismaService(config.databaseUrl),
        },
      ],
      exports: [APP_CONFIG, PrismaService],
    };
  }
}
