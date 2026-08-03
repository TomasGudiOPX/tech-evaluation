import helmet from '@fastify/helmet';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

export async function registerSecurity(app: NestFastifyApplication) {
  await app.register(helmet, { contentSecurityPolicy: false });
}
