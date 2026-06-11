import { User } from '../../entities/User.js';
import { ConflictError } from '../../errors/ConflictError.js';
import { IPasswordHasher } from '../../ports/driven/IPasswordHasher.js';
import {
  IRegisterUserInput,
  IRegisterUserUseCase,
} from '../../ports/driving/IRegisterUserUseCase.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';
import { randomUUID } from 'node:crypto';

export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: IRegisterUserInput): Promise<User> {
    const userByEmail = await this.userRepository.findByEmail(input.email);
    if (userByEmail) {
      throw new ConflictError('The email already exists');
    }

    const hash = await this.passwordHasher.hash(input.password);

    const newUser = User.create({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      passwordHash: hash,
      role: input.role,
      createdAt: new Date(),
    });

    await this.userRepository.save(newUser);

    return newUser;
  }
}
