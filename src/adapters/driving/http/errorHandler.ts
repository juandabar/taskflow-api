import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
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
  _request: FastifyRequest,
  reply: FastifyReply,
): void => {
  let status = 500;
  let title = 'Internal server error';
  let slug = 'internal-server-error';

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
  } else if (error instanceof ZodError) {
    status = 400;
    title = 'Validation error';
    slug = 'validation';
  }

  const detail =
    error instanceof ZodError
      ? `${error.issues[0].path}: ${error.issues[0].message}`
      : status !== 500
        ? error.message
        : 'An unexpected error occurred';

  const body: IErrorResponseBody = {
    type: `https://taskflow.api/errors/${slug}`,
    title,
    status,
    detail,
  };

  reply.status(status).send(body);
};
