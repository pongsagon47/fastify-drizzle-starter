import type { FastifyInstance } from 'fastify';
import { UsersService } from '@/modules/users/users.service';
import { authenticate, requireRole } from '@/middlewares/authenticate';
import {
  createUserZod,
  updateUserZod,
  userParamsZod,
  userQueryZod,
  UserResponse,
} from '@/modules/users/users.schema';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createMeta, paginatedResponse, successResponse } from '@/shared/response';

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
      const { rows, total } = await service.getAll(req.query);
      const meta = createMeta(req.query.page, req.query.limit, total);
      return reply.send(paginatedResponse<UserResponse[]>(rows, meta, 'Retrieved users successfully'));
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
      const user = await service.getById(id);
      return reply.send(successResponse<UserResponse>(user, 'Retrieved user successfully'));
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
      const user = await service.create(req.body);
      return reply.code(201).send(successResponse<UserResponse>(user, 'User created successfully'));
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
      const user = await service.update(id, req.body);
      return reply.send(successResponse<UserResponse>(user, 'User updated successfully'));
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
      await service.uploadAvatar(id, req);
      return reply.send(successResponse(null, 'Avatar uploaded successfully'));
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
      await service.delete(id);
      return reply.send(successResponse(null, 'User deleted successfully'));
    },
  });
}
