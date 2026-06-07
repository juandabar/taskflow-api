import { FastifyRequest, FastifyReply } from 'fastify';

export class UserController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(201).send({
      message: 'Usuario creado',
    });
  }
}
