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

Visit:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/config
```

`GET /config` returns the configuration values validated and transformed by `@raytonx/config`.

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
