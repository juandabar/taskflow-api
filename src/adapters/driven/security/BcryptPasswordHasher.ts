import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../../../domain/ports/driven/IPasswordHasher.js';

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return await bcrypt.hash(plain, 10);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }
}
