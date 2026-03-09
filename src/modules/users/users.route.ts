import type { FastifyInstance } from 'fastify';
import { UsersService } from '@/modules/users/users.service.js';
import { authenticate, requireRole } from '@/middlewares/authenticate.js';
import {
  createUserZod,
  updateUserZod,
  userParamsZod,
  userQueryZod,
} from '@/modules/users/users.schema.js';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

const service = new UsersService();

export async function usersRoutes(app: FastifyInstance) {
  const zApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /users — list all (admin only)
  zApp.get('/', {
    schema: {
      querystring: userQueryZod,
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
    },
    preHandler: [authenticate],
    handler: async (req, reply) => {
      const { id } = req.params;
      const result = await service.update(id, req.body);
      return reply.send(result);
    },
  });

  // DELETE /users/:id — delete (admin only)
  zApp.delete('/:id', {
    schema: {
      params: userParamsZod,
    },
    preHandler: [authenticate, requireRole('admin')],
    handler: async (req, reply) => {
      const { id } = req.params;
      const result = await service.delete(id);
      return reply.send(result);
    },
  });
}
