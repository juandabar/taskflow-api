import { DomainError } from './DomainError.js';

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
