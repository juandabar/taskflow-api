import { UserRole } from '../value-objects/UserRole.js';
import { ValidationError } from '../errors/ValidationError.js';

interface IUserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

export class User {
  private constructor(
    private _id: string,
    private _name: string,
    private _email: string,
    private _passwordHash: string,
    private _role: UserRole,
    private _createdAt: Date,
  ) {}

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get role(): UserRole {
    return this._role;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  static create(user: IUserProps): User {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!user.id) {
      throw new ValidationError('id is required');
    }

    if (!user.name) {
      throw new ValidationError('name is required');
    }

    if (!user.passwordHash) {
      throw new ValidationError('passwordHash is required');
    }

    return new User(user.id, user.name, user.email, user.passwordHash, user.role, user.createdAt);
  }
}
