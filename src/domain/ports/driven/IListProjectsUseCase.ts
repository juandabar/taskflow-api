import { Project } from '../../entities/Project.js';
import { ProjectStatus } from '../../value-objects/ProjectStatus.js';

export interface IListProjectsUseCase {
  execute(status?: ProjectStatus): Promise<Project[]>;
}
