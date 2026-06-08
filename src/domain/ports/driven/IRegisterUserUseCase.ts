import { User } from '../../entities/User.js';
import { UserRole } from '../../value-objects/UserRole.js';

export interface IRegisterUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface IRegisterUserUseCase {
  execute(input: IRegisterUserInput): Promise<User>;
}
