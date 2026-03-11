import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: number;
      email: string;
      role: string;
      jti: string;
    };
    user: {
      id: number;
      email: string;
      role: string;
      jti: string;
      exp: number;
      iat: number;
    };
  }
}
