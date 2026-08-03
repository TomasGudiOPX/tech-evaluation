import { createProjectSchema, type Project } from '@vps-template/contracts/projects';
import { ProjectRepository, type ProjectRow } from './project.repository.js';

function toProject(row: ProjectRow): Project {
  return {
    ...row,
    created_at: row.created_at.toISOString(),
  };
}

export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  async initialize() {
    await this.repository.initialize();
  }

  async listRecent(limit = 100) {
    const rows = await this.repository.listRecent(Math.min(Math.max(limit, 1), 100));
    return rows.map(toProject);
  }

  async create(input: unknown) {
    const project = createProjectSchema.parse(input);
    return toProject(await this.repository.create(project.name));
  }
}
