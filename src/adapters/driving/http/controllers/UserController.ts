import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterUserSchema } from '../schemas/user.schema.js';
import { IRegisterUserUseCase } from '../../../../domain/ports/driven/IRegisterUserUseCase.js';
import { USER_ROLE, UserRole } from '../../../../domain/value-objects/UserRole.js';

interface IRegisterResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export class UserController {
  constructor(private registerUserUseCase: IRegisterUserUseCase) {}

  async register(request: FastifyRequest, reply: FastifyReply): Promise<IRegisterResponse> {
    const body = RegisterUserSchema.parse(request.body);

    const newUser = await this.registerUserUseCase.execute({
      name: body.name,
      email: body.email,
      password: body.password,
      role: USER_ROLE.MEMBER,
    });

    return reply.status(201).send({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    });
  }
}
