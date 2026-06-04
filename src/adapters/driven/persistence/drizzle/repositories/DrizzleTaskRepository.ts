import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { ITaskRepository } from '../../../../../domain/ports/driven/ITaskRepository.js';
import { TaskStatus } from '../../../../../domain/value-objects/TaskStatus.js';
import { Priority } from '../../../../../domain/value-objects/Priority.js';
import { tasks } from '../schema/task.js';
import { Task } from '../../../../../domain/entities/Task.js';
import { and, eq } from 'drizzle-orm';

interface IPlainTask {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  createdAt: Date;
}

export class DrizzleTaskRepository implements ITaskRepository {
  constructor(private db: BetterSQLite3Database) {}

  private formatToTask(task: IPlainTask): Task {
    return Task.create({
      id: task.id,
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assigneeId: task.assigneeId || undefined,
      status: task.status as TaskStatus,
      priority: task.priority as Priority,
      dueDate: task.dueDate || undefined,
      createdAt: task.createdAt,
    });
  }

  private drawTasks(tasks: IPlainTask[]): Task[] {
    return tasks.map((row) =>
      this.formatToTask({
        id: row.id,
        title: row.title,
        description: row.description,
        projectId: row.projectId,
        assigneeId: row.assigneeId,
        status: row.status,
        priority: row.priority,
        dueDate: row.dueDate,
        createdAt: row.createdAt,
      }),
    );
  }

  async findByProjectId(
    projectId: string,
    filters?: {
      status?: TaskStatus;
      priority?: Priority;
      assigneeId?: string;
    },
  ): Promise<Task[]> {
    const result = this.db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, projectId),
          filters && filters.status ? eq(tasks.status, filters.status) : undefined,
          filters && filters.priority ? eq(tasks.priority, filters.priority) : undefined,
          filters && filters.assigneeId ? eq(tasks.assigneeId, filters.assigneeId) : undefined,
        ),
      )
      .all();

    return this.drawTasks(result);
  }

  async findById(id: string): Promise<Task | null> {
    const result = this.db.select().from(tasks).where(eq(tasks.id, id)).get();

    if (!result) {
      return null;
    }

    return this.formatToTask(result);
  }

  async update(task: Task): Promise<void> {
    this.db
      .update(tasks)
      .set({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        assigneeId: task.assigneeId ?? null,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ?? null,
        createdAt: task.createdAt,
      })
      .where(eq(tasks.id, task.id))
      .run();
  }

  async save(task: Task): Promise<void> {
    this.db
      .insert(tasks)
      .values({
        id: task.id,
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        assigneeId: task.assigneeId,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
      })
      .run();
  }
}
