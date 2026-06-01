import { DomainError } from './DomainError.js';

export class UnauthorizedError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
