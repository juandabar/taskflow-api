import { UserRole } from '../../value-objects/UserRole.js';

export interface IPayload {
  id: string;
  role: UserRole;
}

export interface IJwtService {
  sign(payload: IPayload): string;
  verify(token: string): IPayload;
}
