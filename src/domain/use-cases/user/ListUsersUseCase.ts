import { User } from '../../entities/User.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';

export class ListUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
