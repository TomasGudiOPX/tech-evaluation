import 'dotenv/config';

import { createApp } from './app.js';
import { readAppConfig } from './platform/config.js';

const config = readAppConfig();
const app = await createApp(config);

try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
} catch (error) {
  console.error(error);
  process.exit(1);
}
