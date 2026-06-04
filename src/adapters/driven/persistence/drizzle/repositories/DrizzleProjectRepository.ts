import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { IProjectRepository } from '../../../../../domain/ports/driven/IProjectRepository.js';
import { ProjectStatus } from '../../../../../domain/value-objects/ProjectStatus.js';
import { Project } from '../../../../../domain/entities/Project.js';
import { projects } from '../schema/project.js';
import { eq } from 'drizzle-orm';

interface IPlainProject {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: string;
  createdAt: Date;
}

export class DrizzleProjectRepository implements IProjectRepository {
  constructor(private db: BetterSQLite3Database) {}

  private formatToProject(project: IPlainProject): Project {
    return Project.create({
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      status: project.status as ProjectStatus,
      createdAt: project.createdAt,
    });
  }

  private drawProjects(projects: IPlainProject[]): Project[] {
    return projects.map((row) =>
      this.formatToProject({
        id: row.id,
        name: row.name,
        description: row.description,
        ownerId: row.ownerId,
        status: row.status,
        createdAt: row.createdAt,
      }),
    );
  }

  async findAll(state?: ProjectStatus): Promise<Project[]> {
    const result = this.db
      .select()
      .from(projects)
      .where(state ? eq(projects.status, state) : undefined)
      .all();

    return this.drawProjects(result);
  }

  async findById(id: string): Promise<Project | null> {
    const result = this.db.select().from(projects).where(eq(projects.id, id)).get();

    if (!result) {
      return null;
    }

    return this.formatToProject(result);
  }

  async save(project: Project): Promise<void> {
    this.db
      .insert(projects)
      .values({
        id: project.id,
        name: project.name,
        description: project.description,
        ownerId: project.ownerId,
        status: project.status,
        createdAt: project.createdAt,
      })
      .run();
  }

  async update(project: Project): Promise<void> {
    this.db
      .update(projects)
      .set({
        name: project.name,
        description: project.description,
        ownerId: project.ownerId,
        status: project.status,
      })
      .where(eq(projects.id, project.id))
      .run();
  }
}
