import { Project } from '../../entities/Project.js';

export interface ICreateProjectInput {
  name: string;
  description: string;
  ownerId: string;
}

export interface ICreateProjectUseCase {
  execute(input: ICreateProjectInput): Promise<Project>;
}
