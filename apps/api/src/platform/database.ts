import { Pool } from 'pg';

export function createDatabasePool(databaseUrl: string) {
  return new Pool({ connectionString: databaseUrl });
}
