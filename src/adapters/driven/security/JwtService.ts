import jwt from 'jsonwebtoken';
import { env } from '../../../infrastructure/config/env.js';
import { IJwtService, IPayload } from '../../../domain/ports/driven/IJwtService.js';

export class JwtService implements IJwtService {
  sign(payload: IPayload): string {
    const privateKey = env.JWT_SECRET;
    return jwt.sign(payload, privateKey, { expiresIn: '10m' });
  }

  verify(token: string): IPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET) as IPayload;

    return {
      id: decoded.id,
      role: decoded.role,
    };
  }
}
