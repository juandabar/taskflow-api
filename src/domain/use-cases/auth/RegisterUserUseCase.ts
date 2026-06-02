import { User } from '../../entities/User.js';
import { ConflictError } from '../../errors/ConflictError.js';
import { IPasswordHasher } from '../../ports/driven/IPasswordHasher.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';
import { UserRole } from '../../value-objects/UserRole.js';
import { randomUUID } from 'node:crypto';

interface IInputProps {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: IInputProps): Promise<User> {
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
