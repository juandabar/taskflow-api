import { Project } from '../../entities/Project.js';

export interface IGetProjectByIdUseCase {
  execute(id: string): Promise<Project>;
}
