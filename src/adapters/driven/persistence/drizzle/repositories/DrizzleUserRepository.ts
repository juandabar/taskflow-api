import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { IUserRepository } from '../../../../../domain/ports/driven/IUserRepository.js';
import { users } from '../schema/user.js';
import { User } from '../../../../../domain/entities/User.js';
import { UserRole } from '../../../../../domain/value-objects/UserRole.js';
import { eq } from 'drizzle-orm';

interface IPlainUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

export class DrizzleUserRepository implements IUserRepository {
  constructor(private db: BetterSQLite3Database) {}

  private formatToUser(user: IPlainUser): User {
    return User.create({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as UserRole,
      createdAt: user.createdAt,
    });
  }

  private drawUsers(users: IPlainUser[]): User[] {
    return users.map((row) =>
      this.formatToUser({
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.passwordHash,
        role: row.role,
        createdAt: row.createdAt,
      }),
    );
  }

  async findAll(): Promise<User[]> {
    const result = this.db.select().from(users).all();

    return this.drawUsers(result);
  }

  async findById(id: string): Promise<User | null> {
    const result = this.db.select().from(users).where(eq(users.id, id)).get();

    if (!result) {
      return null;
    }

    return this.formatToUser(result);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = this.db.select().from(users).where(eq(users.email, email)).get();

    if (!result) {
      return null;
    }

    return this.formatToUser(result);
  }

  async save(user: User): Promise<void> {
    this.db
      .insert(users)
      .values({
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        createdAt: user.createdAt,
      })
      .run();
  }
}
