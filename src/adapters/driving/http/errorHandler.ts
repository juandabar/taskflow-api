import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ConflictError } from '../../../domain/errors/ConflictError.js';
import { ForbiddenError } from '../../../domain/errors/ForbiddenError.js';
import { NotFoundError } from '../../../domain/errors/NotFoundError.js';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError.js';
import { ValidationError } from '../../../domain/errors/ValidationError.js';

interface IErrorResponseBody {
  type: string;
  title: string;
  status: number;
  detail: string;
}

export const errorHandler = (
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  let status = 500;
  let title = 'Internal server error';
  let slug = 'internal-server-error';

  request.log.error({ url: request.url, method: request.method }, error.message);

  if (error instanceof ConflictError) {
    status = 409;
    title = 'Conflict';
    slug = 'conflict';
  } else if (error instanceof ForbiddenError) {
    status = 403;
    title = 'Forbidden';
    slug = 'forbidden';
  } else if (error instanceof NotFoundError) {
    status = 404;
    title = 'Resource not found';
    slug = 'not-found';
  } else if (error instanceof UnauthorizedError) {
    status = 401;
    title = 'Unauthorized';
    slug = 'unauthorized';
  } else if (error instanceof ValidationError) {
    status = 400;
    title = 'Validation error';
    slug = 'validation';
  }

  const body: IErrorResponseBody = {
    type: `https://taskflow.api/errors/${slug}`,
    title,
    status,
    detail: status !== 500 ? error.message : 'An unexpected error occurred',
  };

  reply.status(status).send(body);
};
