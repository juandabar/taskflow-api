import { User } from '../../entities/User.js';

export interface IGetUserByIdUseCase {
  execute(id: string): Promise<User>;
}
