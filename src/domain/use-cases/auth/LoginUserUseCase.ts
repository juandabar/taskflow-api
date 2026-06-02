import { User } from '../../entities/User.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { UnauthorizedError } from '../../errors/UnauthorizedError.js';
import { IPasswordHasher } from '../../ports/driven/IPasswordHasher.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';

interface IInputProps {
  email: string;
  password: string;
}

export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: IInputProps): Promise<User> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new NotFoundError('the entered credentials are incorrect');
    }

    const validPassword = await this.passwordHasher.compare(input.password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedError('the entered credentials are incorrect');
    }

    return user;
  }
}
