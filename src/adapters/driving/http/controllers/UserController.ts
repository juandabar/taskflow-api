import { FastifyRequest, FastifyReply } from 'fastify';
import {
  LoginUserSchema,
  PathParamsUserSchema,
  RegisterUserSchema,
} from '../schemas/user.schema.js';
import { IRegisterUserUseCase } from '../../../../domain/ports/driven/IRegisterUserUseCase.js';
import { USER_ROLE } from '../../../../domain/value-objects/UserRole.js';
import { ILoginUserUseCase } from '../../../../domain/ports/driven/ILoginUserUseCase.js';
import { IListUsersUseCase } from '../../../../domain/ports/driven/IListUsersUseCase.js';
import { IGetUserByIdUseCase } from '../../../../domain/ports/driven/IGetUserByIdUseCase.js';
import { ForbiddenError } from '../../../../domain/errors/ForbiddenError.js';

export class UserController {
  constructor(
    private registerUserUseCase: IRegisterUserUseCase,
    private loginUserUseCase: ILoginUserUseCase,
    private listUsersUseCase: IListUsersUseCase,
    private getUserByIdUseCase: IGetUserByIdUseCase,
  ) {}

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = RegisterUserSchema.parse(request.body);

    const newUser = await this.registerUserUseCase.execute({
      name: body.name,
      email: body.email,
      password: body.password,
      role: USER_ROLE.MEMBER,
    });

    reply.status(201).send({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    });
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = LoginUserSchema.parse(request.body);

    const token = await this.loginUserUseCase.execute({
      email: body.email,
      password: body.password,
    });

    reply.status(200).send({ token });
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (request.userRole !== USER_ROLE.ADMIN) {
      throw new ForbiddenError('this resource is only for admin users');
    }
    const users = await this.listUsersUseCase.execute();

    reply.send(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    );
  }

  async getUserById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = PathParamsUserSchema.parse(request.params);

    const user = await this.getUserByIdUseCase.execute(params.id);

    reply.send({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  }
}
