import { User } from '../../entities/User.js';
import { IListUsersUseCase } from '../../ports/driving/IListUsersUseCase.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';

export class ListUsersUseCase implements IListUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
