import { Project } from '../../entities/Project.js';
import { ProjectStatus } from '../../value-objects/ProjectStatus.js';

export interface IProjectRepository {
  findAll(state?: ProjectStatus): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  save(project: Project): Promise<void>;
  update(project: Project): Promise<void>;
}
