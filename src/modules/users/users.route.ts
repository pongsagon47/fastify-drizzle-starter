import type { FastifyInstance } from 'fastify';
import { UsersService } from '@/modules/users/users.service';
import { authenticate, requireRole } from '@/middlewares/authenticate';
import {
  createUserZod,
  updateUserZod,
  userParamsZod,
  userQueryZod,
} from '@/modules/users/users.schema';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

const service = new UsersService();

export async function usersRoutes(app: FastifyInstance) {
  const zApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /users — list all (admin only)
  zApp.get('/', {
    schema: {
      querystring: userQueryZod,
      tags: ['Users'],
      summary: 'List all users',
    },
    preHandler: [authenticate, requireRole('admin')],
    handler: async (req, reply) => {
      const result = await service.getAll(req.query);
      return reply.send(result);
    },
  });

  // GET /users/:id — get one
  zApp.get('/:id', {
    schema: {
      params: userParamsZod,
      tags: ['Users'],
      summary: 'Get one user',
    },
    preHandler: [authenticate],
    handler: async (req, reply) => {
      const { id } = req.params;
      const result = await service.getById(id);
      return reply.send(result);
    },
  });

  // POST /users — create
  zApp.post('/', {
    schema: {
      body: createUserZod,
      tags: ['Users'],
      summary: 'Create a new user',
    },
    handler: async (req, reply) => {
      const result = await service.create(req.body);
      return reply.code(201).send(result);
    },
  });

  // PATCH /users/:id — update
  zApp.patch('/:id', {
    schema: {
      params: userParamsZod,
      body: updateUserZod,
      tags: ['Users'],
      summary: 'Update a user',
    },
    preHandler: [authenticate],
    handler: async (req, reply) => {
      const { id } = req.params;
      const result = await service.update(id, req.body);
      return reply.send(result);
    },
  });

  // PATCH /api/v1/users/:id/avatar
  zApp.patch('/:id/avatar', {
    schema: {
      tags: ['Users'],
      params: userParamsZod,
    },
    preHandler: [authenticate],
    handler: async (req, reply) => {
      const { id } = req.params;
      const result = await service.uploadAvatar(id, req);
      return reply.send(result);
    },
  });

  // DELETE /users/:id — delete (admin only)
  zApp.delete('/:id', {
    schema: {
      params: userParamsZod,
      tags: ['Users'],
      summary: 'Delete a user',
    },
    preHandler: [authenticate, requireRole('admin')],
    handler: async (req, reply) => {
      const { id } = req.params;
      const result = await service.delete(id);
      return reply.send(result);
    },
  });
}
