# RaytonX Example App

This is an independent NestJS example application for demonstrating real installation and integration of RaytonX Nest packages in later steps.

This app is not part of the repository root pnpm workspace. Run install, development, build, and test commands from this directory.

Chinese version: [README.md](README.md)

## Requirements

- Node.js 20+
- pnpm 10+
- Redis 7+, used by the Redis and scheduler distributed lock examples

## Install

```bash
cd apps/example
pnpm install
```

## Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configuration is loaded by `@raytonx/config` and validated/transformed with a Zod schema:

- `NODE_ENV`: Runtime environment. Defaults to `development`.
- `PORT`: HTTP server port. Defaults to `3000`.
- `REDIS_URL`: Redis connection URL. Defaults to `redis://127.0.0.1:6379`.
- `SERVICE_NAME`: Service name returned by the health endpoint. Defaults to `raytonx-example`.
- `LOG_LEVEL`: Log level. Defaults to `info`.
- `LOG_PRETTY`: Whether to enable the `@raytonx/nest-logger` pretty console output. Defaults to `false`.

`envFilePath: "auto"` loads `.env`, `.env.local`, `.env.${NODE_ENV}`, and `.env.${NODE_ENV}.local` from the current working directory.

## Run

Start Redis:

```bash
docker run --rm -p 6379:6379 redis:7-alpine
```

Start the example app:

```bash
pnpm dev
```

`pnpm dev` compiles with `tsc` first, then runs `node --watch dist/main.js`, so the example code matches the production build runtime.

`pnpm dev` temporarily injects `LOG_PRETTY=1`, so `@raytonx/nest-logger` automatically enables more readable pretty console logs. `pnpm start` keeps the default JSON structured logs. This behavior is controlled by `LOG_PRETTY`, not by `NODE_ENV`.

If Redis is not running or `REDIS_URL` cannot be reached, the app fails during startup with a clear message that Redis must be started first. This check is handled by `RedisStartupProbe`, so the scheduler Redis lock example does not silently run with Redis unavailable.

Basic health check:

```bash
curl http://localhost:3000/health
```

## Module Examples

### `@raytonx/config`

What this example does:

- Registers `ConfigModule.forRoot` globally in `AppModule`.
- Uses `envFilePath: "auto"` to load env files from the current directory.
- Validates and transforms config values with a Zod schema.
- Reads config values through `ConfigService` in `ConfigController` and `HealthController`.

How to inspect it:

```bash
curl http://localhost:3000/config
```

What to verify:

- `port` is transformed into a number.
- `serviceName` comes from `SERVICE_NAME` or its default value.
- The response shows validated and transformed config values instead of raw string environment variables.

### `@raytonx/nest-logger`

What this example does:

- Registers `LoggerModule.forRootAsync` in `AppModule`.
- Reads `NODE_ENV`, `SERVICE_NAME`, and `LOG_LEVEL` from `ConfigService`.
- Uses the `LOG_PRETTY` environment variable to control pretty console logs without manually configuring `pinoHttp.transport`.
- Replaces the Nest logger in `main.ts` with `app.useLogger(app.get(Logger))`.
- Uses `@Log()` in `LoggerDemoService` to emit method-level logs.

How to inspect it:

```bash
curl http://localhost:3000/logger/demo
```

What to verify:

- The console prints structured Pino request logs.
- `pnpm dev` shows a more readable pretty log format, while runs without `LOG_PRETTY` keep JSON structured output.
- `@Log()` emits method execution events, duration, arguments, and return values.
- Example `password` and `token` arguments are redacted.

### `@raytonx/nest-response`

What this example does:

- Registers `ResponseModule.forRoot({ isGlobal: true })` in `AppModule` to enable the global transform interceptor and exception filter.
- Automatically wraps plain controller return values in the standard response envelope.
- Leaves envelopes created with `ResponseBuilder.success()` unchanged instead of wrapping them again.
- Converts thrown `BadRequestException` values into the standard error envelope.

How to inspect it:

```bash
curl http://localhost:3000/response/success
curl http://localhost:3000/response/manual
curl http://localhost:3000/response/error
```

What to verify:

- `/response/success` returns data wrapped in the `{ success, code, message, data }` structure.
- `/response/manual` keeps the custom `code` and `message` produced by `ResponseBuilder.success()`.
- `/response/error` returns `400` and uses the standard error envelope instead of the default Nest exception body.

### `@raytonx/nest-scheduler`

What this example does:

- Registers `ScheduleModule.forRoot()` and `SchedulerModule.forRoot()` in `AppModule`.
- Uses the `redis` driver to demonstrate cross-process distributed locking.
- Connects to `REDIS_URL` through `@raytonx/nest-redis` and reuses Redis lock configuration.
- Registers three tasks in `SchedulerDemoService`:
  - `redis-heartbeat`: runs every 10 seconds and holds the Redis lock for about 4 seconds so lock contention is easy to observe across processes.
  - `redis-failure`: runs every 20 seconds, holds the Redis lock for about 6 seconds, and then throws intentionally so contention and failure logs are easy to observe across processes.
  - `redis-ttl-expiry`: runs every 20 seconds, uses a 2-second lock TTL, runs for 8 seconds, and disables auto extension so contention happens first and lock expiry or release failure logs can still be inspected.

How to inspect it:

```bash
curl http://localhost:3000/scheduler/status
```

What to verify:

- `instanceId` is the current Node.js process pid, which helps distinguish multiple processes.
- `redisLockKeys` lists the Redis lock keys used by this example.
- `redis-heartbeat` increases `runCount` only when the current process successfully acquires the lock.
- `redis-failure` and `redis-ttl-expiry` also increase `runCount` only when the current process acquires the lock; the other process should log `task_skipped` for the same tick.
- `redis-failure` records the intentional error in `lastError`.
- `redis-ttl-expiry` runs longer than its lock TTL, so the console can show lock expiration or release failure logs.

Multi-process verification:

```bash
PORT=3000 pnpm start
PORT=3001 pnpm start
```

When both processes use the same `REDIS_URL`, each task tick should be executed by only one process. Inspect `/scheduler/status` on both ports to compare task run counts across different `instanceId` values: for a given tick, only one process should increase the matching `runCount`, while the other stays flat. In each process console, you should also see the expected `task_succeeded`, `task_failed`, `task_skipped`, and `lock_expired_before_finish` log entries.

## Build And Start

```bash
pnpm build
pnpm start
```

## E2E Tests

```bash
pnpm test:e2e
```

This step only initializes the test configuration. E2E cases will be added when RaytonX modules are integrated.
