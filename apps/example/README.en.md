# RaytonX Example App

This is an independent NestJS example application for demonstrating real installation and integration of RaytonX Nest packages in later steps.

This app is not part of the repository root pnpm workspace. Run install, development, build, and test commands from this directory.

Chinese version: [README.md](README.md)

## Requirements

- Node.js 20+
- pnpm 10+

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

`envFilePath: "auto"` loads `.env`, `.env.local`, `.env.${NODE_ENV}`, and `.env.${NODE_ENV}.local` from the current working directory.

## Run

```bash
pnpm dev
```

`pnpm dev` compiles with `tsc` first, then runs `node --watch dist/main.js`, so the example code matches the production build runtime.

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
- Replaces the Nest logger in `main.ts` with `app.useLogger(app.get(Logger))`.
- Uses `@Log()` in `LoggerDemoService` to emit method-level logs.

How to inspect it:

```bash
curl http://localhost:3000/logger/demo
```

What to verify:

- The console prints structured Pino request logs.
- `@Log()` emits method execution events, duration, arguments, and return values.
- Example `password` and `token` arguments are redacted.

### `@raytonx/nest-scheduler`

What this example does:

- Registers `ScheduleModule.forRoot()` and `SchedulerModule.forRoot()` in `AppModule`.
- Uses the `memory` driver to demonstrate process-local locking without Redis.
- Registers a task in `SchedulerDemoService` with `@DistributedInterval` that runs every 30 seconds.
- Tracks the run count and last run time.

How to inspect it:

```bash
curl http://localhost:3000/scheduler/status
```

What to verify:

- `runCount` increases as the scheduled task runs.
- `lastRunAt` becomes an ISO timestamp after the task runs.
- The console prints verbose scheduler logs for task start, lock acquisition, completion, and lock release.

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
