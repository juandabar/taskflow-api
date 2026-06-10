import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { PROJECT_STATUS_VALUES } from '../../../../domain/value-objects/ProjectStatus.js';

extendZodWithOpenApi(z);

export const CreateProjectSchema = z
  .object({
    name: z.string().min(5),
    description: z.string().min(5),
  })
  .openapi('CreateProjectRequest');

export const QueryProjectSchema = z
  .object({
    status: z.enum(PROJECT_STATUS_VALUES).optional(),
  })
  .openapi('ProjectQuery');

export const PathProjectSchema = z
  .object({
    id: z.uuid(),
  })
  .openapi('ProjectPath');

export const FileProjectSchema = z
  .object({
    id: z.uuid(),
  })
  .openapi('FileProjectRequest');
