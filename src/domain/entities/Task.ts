import { ValidationError } from '../errors/ValidationError.js';
import { Priority } from '../value-objects/Priority.js';
import { TASK_STATUS, TaskStatus } from '../value-objects/TaskStatus.js';

interface ITaskProps {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  createdAt: Date;
}

export class Task {
  private constructor(
    private _id: string,
    private _title: string,
    private _description: string,
    private _projectId: string,
    private _assigneeId: string | null,
    private _status: TaskStatus,
    private _priority: Priority,
    private _dueDate: Date | null,
    private _createdAt: Date,
  ) {}

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get projectId(): string {
    return this._projectId;
  }

  get assigneeId(): string | null {
    return this._assigneeId;
  }

  get status(): TaskStatus {
    return this._status;
  }

  get priority(): Priority {
    return this._priority;
  }

  get dueDate(): Date | null {
    return this._dueDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  updateStatus(newStatus: TaskStatus): void {
    const VALID_TRANSITION: Record<TaskStatus, TaskStatus[]> = {
      [TASK_STATUS.TODO]: [TASK_STATUS.IN_PROGRESS],
      [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.REVIEW],
      [TASK_STATUS.REVIEW]: [TASK_STATUS.DONE, TASK_STATUS.IN_PROGRESS],
      [TASK_STATUS.DONE]: [],
    };
    if (!VALID_TRANSITION[this._status].includes(newStatus)) {
      throw new ValidationError(
        `invalid state transition from state ${this._status} to state ${newStatus}`,
      );
    }
    this._status = newStatus;
  }

  assign(userId: string): void {
    if (!userId) {
      throw new ValidationError('userId is required');
    }
    this._assigneeId = userId;
  }

  static create(task: ITaskProps): Task {
    if (!task.id) {
      throw new ValidationError('id is required');
    }

    if (!task.title) {
      throw new ValidationError('title is required');
    }

    if (!task.description) {
      throw new ValidationError('description is required');
    }

    if (!task.projectId) {
      throw new ValidationError('projectId is required');
    }

    if (task.dueDate && task.dueDate < new Date()) {
      throw new ValidationError('dueDate cannot be in the past');
    }

    return new Task(
      task.id,
      task.title,
      task.description,
      task.projectId,
      task.assigneeId || null,
      task.status,
      task.priority,
      task.dueDate || null,
      task.createdAt,
    );
  }
}
