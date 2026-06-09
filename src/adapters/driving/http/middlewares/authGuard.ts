import { FastifyReply, FastifyRequest, preHandlerAsyncHookHandler } from 'fastify';
import { IJwtService } from '../../../../domain/ports/driven/IJwtService.js';
import { UnauthorizedError } from '../../../../domain/errors/UnauthorizedError.js';
import { ValidationError } from '../../../../domain/errors/ValidationError.js';
import { UserRole } from '../../../../domain/value-objects/UserRole.js';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    userRole: UserRole;
  }
}

export function createAuthGuard(jwtService: IJwtService): preHandlerAsyncHookHandler {
  return async function authGuard(request: FastifyRequest, _reply: FastifyReply) {
    if (!request.headers.authorization) {
      throw new ValidationError('the token is required');
    }

    const parts = request.headers.authorization.split(' ');
    if (parts[0] !== 'Bearer' || !parts[1]) {
      throw new ValidationError('the Bearer token format is incorrect');
    }

    try {
      const token = parts[1];
      const payload = jwtService.verify(token);

      request.userId = payload.id;
      request.userRole = payload.role;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  };
}
