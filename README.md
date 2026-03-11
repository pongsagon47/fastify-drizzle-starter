## Fastify + Drizzle + TypeScript Starter

Production-ready REST API starter using **Fastify 5**, **Drizzle ORM**, and **TypeScript** with **MySQL**.

---

## Features

### Core
- **Fastify 5 + TypeScript** — typed request/response with `fastify-type-provider-zod`
- **Drizzle ORM + MySQL** — type-safe queries, migrations, soft delete
- **Zod validation** — request body, query, params
- **OpenAPI/Swagger** — auto-generated docs at `/docs`
- **Compression** — brotli/gzip via `@fastify/compress`
- **Security** — CORS, Helmet, rate limiting (per-route configurable)

### Authentication
- JWT access token (15min) + refresh token (7d) with rotation
- Logout with token blacklist (Redis)
- Password reset flow via email (token expires in 30min)
- Role-based access control (`admin`, `user`)

### Caching (optional — requires Redis)
- Redis-backed response cache for `GET /users` and `GET /users/:id`
- Cache invalidated automatically on create/update/delete
- Rate limit store shared via Redis (across instances)

### Background Jobs (optional — requires Redis + Mailer)
- **BullMQ** email queue with retry (3 attempts, exponential backoff)
- Job types: `welcome`, `reset-password`, `otp`
- Graceful fallback to direct send when Redis is unavailable

### Request Logging (optional — requires MongoDB)
- Every request logged to MongoDB (`request_logs` collection)
- Stores: method, URL, status, response time, IP, user agent, userId, req.body
- Sensitive fields auto-redacted (`password`, `token`, `refreshToken`, etc.)
- TTL index auto-deletes logs after N days (default 30)

### Users Module
- CRUD with pagination, search, soft delete
- Avatar upload with image resize via `sharp`

### Mailer
- Nodemailer + EJS templates (`welcome`, `reset-password`, `otp`)
- Dev tools: preview templates in browser, send test emails

### Developer Experience
- `vitest` test setup with mocks for DB/Redis
- `docker-compose` — MySQL, Redis, MongoDB in one command
- Database seed script
- Pretty logging in development (`pino-pretty`)

---

## Tech Stack

| Category | Library |
|----------|---------|
| Framework | Fastify 5 |
| ORM | Drizzle ORM + mysql2 |
| Validation | Zod + fastify-type-provider-zod |
| Auth | @fastify/jwt + bcrypt |
| Cache / Queue | ioredis + BullMQ |
| Request Logging | mongodb |
| Mailer | Nodemailer + EJS |
| Image processing | sharp |
| Testing | vitest |
| Docs | @fastify/swagger + @fastify/swagger-ui |

---

## Project Structure

```
src/
├── app.ts                    # Fastify app factory (plugins + routes)
├── server.ts                 # Entry point (env, DB check, listen)
├── config/
│   ├── env.ts                # Zod-validated environment variables
│   ├── database.ts           # Drizzle db instance
│   ├── redis.ts              # ioredis client (optional)
│   ├── mongo.ts              # MongoDB client (optional)
│   └── mailer.ts             # Nodemailer transporter factory
├── db/
│   ├── schema/               # Drizzle table definitions
│   ├── migrations/           # Generated SQL migrations
│   ├── helpers/              # Reusable column helpers (timestamps, soft delete, audit)
│   └── seed/index.ts         # Development seed script
├── modules/
│   ├── auth/                 # login, logout, refresh, forgot/reset password
│   ├── users/                # CRUD + avatar upload
│   ├── health/               # /health endpoint with DB + Redis check
│   ├── logs/                 # Request log model (MongoDB)
│   └── dev/                  # Dev-only mail preview/send tools
├── plugins/
│   ├── compress.ts           # @fastify/compress
│   ├── cors.ts               # @fastify/cors
│   ├── helmet.ts             # @fastify/helmet
│   ├── jwt.ts                # @fastify/jwt
│   ├── mailer.ts             # Nodemailer plugin
│   ├── mongo.ts              # MongoDB plugin + TTL index setup
│   ├── multipart.ts          # @fastify/multipart
│   ├── queue.ts              # BullMQ email worker
│   ├── rate-limit.ts         # @fastify/rate-limit (Redis store if available)
│   ├── redis.ts              # ioredis plugin
│   ├── request-logger.ts     # onResponse hook → MongoDB
│   └── swagger.ts            # OpenAPI docs
├── queues/
│   ├── connection.ts         # BullMQ connection options factory
│   └── email/
│       ├── queue.ts          # Queue instance + addEmailJob()
│       └── worker.ts         # Worker processor
├── middlewares/
│   ├── authenticate.ts       # JWT verify + blacklist check
│   └── errorHandler.ts       # Centralized error handler
├── shared/
│   ├── errors.ts             # AppError, NotFoundError, UnauthorizedError, ...
│   └── response.ts           # successResponse, paginatedResponse, errorResponse
├── types/
│   └── jwt.d.ts              # @fastify/jwt type augmentation
└── utils/
    ├── auth/token.ts         # Token helpers (refresh, blacklist, reset)
    ├── cache/cache.ts        # Redis cache helpers (get, set, del)
    ├── mailer/               # sendWelcomeMail, sendResetPasswordMail, sendOtpMail
    ├── time/time.ts          # Date formatting helpers
    └── upload/               # Image upload + resize helpers
```

---

## Getting Started

### Option A — Docker (recommended)

Start MySQL, Redis, and MongoDB with one command:

```bash
docker compose up -d
```

Then copy and configure `.env`:

```bash
cp .env.example .env
```

### Option B — Manual

Install and configure MySQL 8+ manually, then update `.env`.

---

## Environment Variables

```env
NODE_ENV=development
PORT=3800

# DATABASE (required)
DB_HOST=localhost
DB_PORT=3306
DB_USER=dev
DB_PASSWORD=dev
DB_NAME=fastify_dev

# JWT (required)
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=

# MAILER (optional)
MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
MAIL_FROM_NAME=

# UPLOAD
UPLOAD_PATH=uploads

# REDIS (optional — enables caching, Redis rate-limit store, token blacklist, queue)
REDIS_URL=redis://localhost:6379
REDIS_TTL=60

# APP
APP_URL=http://localhost:3000
PASSWORD_RESET_EXPIRES_IN=1800

# MONGODB (optional — enables request logging)
MONGO_URL=mongodb://localhost:27017/fastify_logs
MONGO_LOG_TTL_DAYS=30
```

---

## Setup

```bash
pnpm install          # install dependencies
cp .env.example .env  # configure environment

pnpm db:push          # apply schema to DB (dev)
pnpm db:seed          # seed demo data
pnpm dev              # start dev server
```

Once running:
- API: `http://localhost:3800`
- Swagger docs: `http://localhost:3800/docs`
- Health check: `http://localhost:3800/health`

**Demo credentials (after seed):**
```
admin@example.com / password123  (admin)
alice@example.com / password123  (user)
bob@example.com   / password123  (user)
```

---

## API Overview

### Auth (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | — | Login → `accessToken` + `refreshToken` |
| POST | `/refresh` | — | Rotate tokens |
| POST | `/logout` | JWT | Revoke tokens |
| GET | `/me` | JWT | Current user info |
| POST | `/forgot-password` | — | Send reset link to email |
| POST | `/reset-password` | — | Reset password with token |

### Users (`/api/v1/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | admin | List users (pagination + search) |
| GET | `/:id` | JWT | Get user |
| POST | `/` | — | Create user |
| PATCH | `/:id` | JWT | Update user |
| PATCH | `/:id/avatar` | JWT | Upload avatar |
| DELETE | `/:id` | admin | Soft delete user |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | DB + Redis status with response times |

### Dev (`/api/v1/dev`) — development only

| Method | Path | Description |
|--------|------|-------------|
| GET | `/mail/templates` | List email templates |
| GET | `/mail/preview/:template` | Preview template as HTML |
| POST | `/mail/send/:template` | Send test email |

---

## Database Scripts

```bash
pnpm db:push        # push schema directly to DB (dev)
pnpm db:pull        # introspect existing DB → schema
pnpm db:generate    # generate SQL migration files
pnpm db:migrate     # apply migrations
pnpm db:studio      # open Drizzle Studio
pnpm db:seed        # seed development data
```

---

## Testing

```bash
pnpm test           # run tests once
pnpm test:watch     # watch mode
pnpm test:coverage  # coverage report
```

Tests mock DB and Redis — no external services required.

---

## Optional Services

All external services degrade gracefully — the app starts and runs without them.

| Service | Feature enabled |
|---------|----------------|
| Redis | Caching, token blacklist, refresh tokens, rate-limit store, email queue |
| MongoDB | Request logging |
| Mailer | Emails (welcome, reset-password, otp) |

---

## Extending the Starter

Add a new feature module under `src/modules/<feature>/`:

```
src/modules/posts/
  posts.schema.ts      # Zod DTOs
  posts.repository.ts  # DB queries
  posts.service.ts     # Business logic
  posts.route.ts       # Fastify routes
```

Then register in `src/app.ts`:

```ts
app.register(postsRoutes, { prefix: '/api/v1/posts' });
```

Add a new queue under `src/queues/<name>/`:

```
src/queues/notification/
  queue.ts     # Queue instance + job types + addNotificationJob()
  worker.ts    # Worker processor
```
