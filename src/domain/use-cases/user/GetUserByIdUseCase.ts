import { User } from '../../entities/User.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';

export class GetUserByIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    if (!id) {
      throw new ValidationError('id is required');
    }
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('user not found');
    }
    return user;
  }
}
