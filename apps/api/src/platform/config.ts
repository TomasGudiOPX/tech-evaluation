export type AppConfig = {
  corsOrigin: string | boolean;
  databaseUrl: string;
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

  return {
    corsOrigin: corsOrigin === '*' ? true : corsOrigin,
    databaseUrl,
    mcpApiToken: environment.MCP_API_TOKEN || undefined,
    nodeEnv: environment.NODE_ENV ?? 'development',
    port: Number(environment.PORT ?? 3000),
  };
}
