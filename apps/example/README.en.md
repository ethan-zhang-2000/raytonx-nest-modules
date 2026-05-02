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

The initialized app currently uses:

- `PORT`: HTTP server port. Defaults to `3000`.
- `SERVICE_NAME`: Service name returned by the health endpoint. Defaults to `raytonx-example`.

`REDIS_URL` and `LOG_LEVEL` will be used when RaytonX modules are integrated in later steps.

## Run

```bash
pnpm dev
```

Visit:

```bash
curl http://localhost:3000/health
```

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
