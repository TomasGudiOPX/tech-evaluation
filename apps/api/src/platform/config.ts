export type AppConfig = {
  adminSeedEmail: string | undefined;
  adminSeedPassword: string | undefined;
  corsOrigin: string | boolean;
  databaseUrl: string;
  jwtSecret: string;
  mcpApiToken: string | undefined;
  nodeEnv: string;
  port: number;
};

export function readAppConfig(environment = process.env): AppConfig {
  const databaseUrl = environment.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const corsOrigin = environment.CORS_ORIGIN ?? false;
  const jwtSecret = environment.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  return {
    adminSeedEmail: environment.ADMIN_SEED_EMAIL || undefined,
    adminSeedPassword: environment.ADMIN_SEED_PASSWORD || undefined,
    corsOrigin: corsOrigin === '*' ? true : corsOrigin,
    databaseUrl,
    jwtSecret,
    mcpApiToken: environment.MCP_API_TOKEN || undefined,
    nodeEnv: environment.NODE_ENV ?? 'development',
    port: Number(environment.PORT ?? 3000),
  };
}
