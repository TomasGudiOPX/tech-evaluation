import type { Pool } from 'pg';

export type ProjectRow = {
  id: number;
  name: string;
  created_at: Date;
};

export class ProjectRepository {
  constructor(private readonly pool: Pool) {}

  async initialize() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  async listRecent(limit: number): Promise<ProjectRow[]> {
    const { rows } = await this.pool.query<ProjectRow>(
      'SELECT id, name, created_at FROM projects ORDER BY created_at DESC LIMIT $1',
      [limit],
    );

    return rows;
  }

  async create(name: string): Promise<ProjectRow> {
    const { rows } = await this.pool.query<ProjectRow>(
      'INSERT INTO projects (name) VALUES ($1) RETURNING id, name, created_at',
      [name],
    );

    return rows[0];
  }
}
