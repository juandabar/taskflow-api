import { User } from '../../entities/User.js';

export interface IListUsersUseCase {
  execute(): Promise<User[]>;
}
