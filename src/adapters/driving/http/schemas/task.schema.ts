import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { PRIORITY_VALUES } from '../../../../domain/value-objects/Priority.js';
import { TASK_STATUS_VALUES } from '../../../../domain/value-objects/TaskStatus.js';

extendZodWithOpenApi(z);

export const CreateTaskSchema = z
  .object({
    title: z.string().min(5),
    description: z.string(),
    projectId: z.uuid(),
    priority: z.enum(PRIORITY_VALUES),
    dueDate: z.iso
      .datetime()
      .transform((val) => new Date(val))
      .optional(),
  })
  .openapi('CreateTaskRequest');

export const TaskParamsSchema = z
  .object({
    id: z.uuid(),
  })
  .openapi('TaskParamsRequest');

export const AssignTaskSchema = z
  .object({
    userId: z.uuid(),
  })
  .openapi('AssignTaskRequest');

export const ListTaskSchema = z
  .object({
    projectId: z.uuid(),
    status: z.enum(TASK_STATUS_VALUES).optional(),
    priority: z.enum(PRIORITY_VALUES).optional(),
    assigneeId: z.uuid().optional(),
  })
  .openapi('ListTaskQuery');

export const UpdateTaskSchema = z
  .object({
    status: z.enum(TASK_STATUS_VALUES),
  })
  .openapi('UpdateTaskRequest');

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type AssignTaskDto = z.infer<typeof AssignTaskSchema>;
export type ListTaskDto = z.infer<typeof ListTaskSchema>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;
