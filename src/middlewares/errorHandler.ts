import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '@/shared/errors.js';
import { errorResponse } from '@/shared/response.js';

export function errorHandler(
  error: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send(errorResponse(error.message));
  }

  if (error instanceof Error && error.name === 'ZodError') {
    return reply.code(422).send(errorResponse('Validation failed'));
  }

  const err = error as FastifyError & { validation?: unknown; };
  if (err.validation) {
    return reply.code(400).send(errorResponse(err.message));
  }

  // 500 — log ด้วย request context ด้วย
  req.log.error({
    err: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    req: {
      method: req.method,
      url: req.url,
    },
  }, 'Internal server error');

  return reply.code(500).send(errorResponse('Internal server error'));
}