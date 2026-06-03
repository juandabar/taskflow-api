import { ValidationError } from '../errors/ValidationError.js';
import { PROJECT_STATUS, ProjectStatus } from '../value-objects/ProjectStatus.js';

interface IProjectProps {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: ProjectStatus;
  createdAt: Date;
}

export class Project {
  private constructor(
    private _id: string,
    private _name: string,
    private _description: string,
    private _ownerId: string,
    private _status: ProjectStatus,
    private _createdAt: Date,
  ) {}

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get status(): ProjectStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  archive(): void {
    if (this._status === PROJECT_STATUS.ARCHIVED) {
      throw new ValidationError('the project is already archived');
    }
    this._status = PROJECT_STATUS.ARCHIVED;
  }

  canAddTasks(): boolean {
    return this._status === PROJECT_STATUS.ACTIVE;
  }

  static create(project: IProjectProps): Project {
    if (!project.id) {
      throw new ValidationError('id is required');
    }

    if (!project.name) {
      throw new ValidationError('name is required');
    }

    if (!project.description) {
      throw new ValidationError('description is required');
    }

    if (!project.ownerId) {
      throw new ValidationError('ownerId is required');
    }

    if (!project.status) {
      throw new ValidationError('status is required');
    }

    if (!project.createdAt) {
      throw new ValidationError('createdAt is required');
    }

    return new Project(
      project.id,
      project.name,
      project.description,
      project.ownerId,
      project.status,
      project.createdAt,
    );
  }
}
