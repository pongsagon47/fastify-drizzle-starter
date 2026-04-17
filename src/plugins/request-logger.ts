import fp from 'fastify-plugin';

interface RequestLog {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  responseTimeMs: number;
  ip: string;
  userAgent: string | null;
  userId: number | null;
  reqBody: Record<string, unknown> | null;
  timestamp: Date;
}

const LOG_COLLECTION = 'request_logs';

// paths ที่ไม่ต้อง log
const SKIP_PATHS = ['/health', '/docs', '/favicon.ico'];

// fields ที่ต้อง redact
const SENSITIVE_FIELDS = new Set([
  'password', 'newPassword', 'oldPassword', 'confirmPassword',
  'token', 'accessToken', 'refreshToken', 'secret',
  'authorization', 'creditCard', 'cvv',
]);

const MAX_BODY_BYTES = 10_000; // 10KB

function shouldSkip(url: string): boolean {
  return SKIP_PATHS.some((p) => url === p || url.startsWith(p + '/'));
}

function redactBody(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    redacted[key] = SENSITIVE_FIELDS.has(key) ? '[REDACTED]' : value;
  }

  // ตัดถ้าใหญ่เกิน 10KB
  const serialized = JSON.stringify(redacted);
  if (serialized.length > MAX_BODY_BYTES) {
    return { _truncated: true, _size: serialized.length };
  }

  return redacted;
}

export const requestLoggerPlugin = fp(async (app) => {
  if (!app.mongo) return;

  const collection = app.mongo.collection<RequestLog>(LOG_COLLECTION);

  app.addHook('onResponse', (request, reply, done) => {
    if (shouldSkip(request.url)) return done();

    const log: RequestLog = {
      requestId: request.id as string,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTimeMs: Math.round(reply.elapsedTime),
      ip: request.ip,
      userAgent: request.headers['user-agent'] ?? null,
      userId: (request.user as { id?: number } | undefined)?.id ?? null,
      reqBody: redactBody(request.body),
      timestamp: new Date(),
    };

    // fire-and-forget — ไม่ block response
    collection.insertOne(log).catch((err) => {
      request.log.error({ err }, 'Failed to save request log');
    });

    done();
  });
}, { name: 'request-logger', dependencies: ['mongo'] });
