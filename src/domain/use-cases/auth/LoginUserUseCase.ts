import { NotFoundError } from '../../errors/NotFoundError.js';
import { UnauthorizedError } from '../../errors/UnauthorizedError.js';
import { IJwtService } from '../../ports/driven/IJwtService.js';
import { ILoginUserInput, ILoginUserUseCase } from '../../ports/driven/ILoginUserUseCase.js';
import { IPasswordHasher } from '../../ports/driven/IPasswordHasher.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
    private jwtService: IJwtService,
  ) {}

  async execute(input: ILoginUserInput): Promise<string> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new NotFoundError('the entered credentials are incorrect');
    }

    const validPassword = await this.passwordHasher.compare(input.password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedError('the entered credentials are incorrect');
    }

    const token = this.jwtService.sign({
      id: user.id,
      role: user.role,
    });

    return token;
  }
}
