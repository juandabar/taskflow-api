import { DomainError } from './DomainError.js';

export class ForbiddenError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
