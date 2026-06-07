import { z } from 'zod';
import { TASK_STATUS_VALUES } from '../../../../domain/value-objects/TaskStatus.js';
import { PRIORITY_VALUES } from '../../../../domain/value-objects/Priority.js';

export const CreateTaskSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  projectId: z.uuid(),
  priority: z.enum(PRIORITY_VALUES),
  dueDate: z.string().datetime().optional(),
});

export const TaskParamsSchema = z.object({
  id: z.uuid(),
});

export const AssignTaskSchema = z.object({
  userId: z.uuid(),
});

export const ListTaskSchema = z.object({
  projectId: z.uuid(),
  status: z.enum(TASK_STATUS_VALUES).optional(),
  priority: z.enum(PRIORITY_VALUES).optional(),
  assigneeId: z.uuid().optional(),
});

export const UpdateTaskSchema = z.object({
  status: z.enum(TASK_STATUS_VALUES),
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type AssignTaskDto = z.infer<typeof AssignTaskSchema>;
export type ListTaskDto = z.infer<typeof ListTaskSchema>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;
