import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const CreateCommentSchema = z
  .object({
    content: z.string().min(5),
    taskId: z.uuid(),
    authorId: z.uuid(),
  })
  .openapi('CreateCommentRequest');

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;
