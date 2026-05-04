# @raytonx/nest-logger

Structured logging module for NestJS applications, powered by Pino and `nestjs-pino`.

Chinese version: [README.md](README.md)

## Installation

```bash
pnpm add @raytonx/nest-logger nestjs-pino pino pino-http
```

If you want pretty console logs, install this optional dependency as well:

```bash
pnpm add pino-pretty
```

## Features

- Replace Nest's default logger with Pino
- Automatically bind `requestId` and `traceId`
- Standardize structured fields such as `service`, `env`, and `level`
- Redact common sensitive fields, Chinese mobile numbers, and Chinese ID card numbers
- Provide a `@Log()` decorator for method args, result, duration, and errors

## Quick Start

```ts
import { Module } from "@nestjs/common";
import { LoggerModule } from "@raytonx/nest-logger";

@Module({
  imports: [
    LoggerModule.forRoot({
      isGlobal: true,
      service: "orders-api",
      env: process.env.NODE_ENV,
    }),
  ],
})
export class AppModule {}
```

Replace Nest's default logger in `main.ts`:

```ts
import { Logger } from "nestjs-pino";

const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});

app.useLogger(app.get(Logger));
app.flushLogs();
```

## Request IDs

By default the module reads and writes:

- `x-request-id`
- `x-trace-id`

If a request does not include these headers, the module generates IDs automatically. When `x-trace-id` is missing, it reuses `requestId`.

If you need custom header names, for example to integrate with an existing gateway, tracing system, or company-wide convention, override the defaults with `requestIdHeader` and `traceIdHeader`:

```ts
LoggerModule.forRoot({
  requestIdHeader: "x-correlation-id",
  traceIdHeader: "traceparent",
});
```

## Standard Fields

Default logs include:

- `service`
- `env`
- `level`
- `requestId`
- `traceId`

## Pretty Output

The module can enable more human-readable console logs through `LOG_PRETTY`. It is disabled by default. The recommended approach is to avoid enabling pretty output in application code and instead inject the environment variable from package scripts based on how the app is being run: `pnpm dev` is usually local development and can enable pretty output, while other runs should keep JSON structured logs.

Recommended script setup:

```json
{
  "scripts": {
    "dev": "LOG_PRETTY=1 node dist/main.js",
    "start": "node dist/main.js"
  }
}
```

You can also control it directly from the command line:

```bash
LOG_PRETTY=1 pnpm dev
```

When the `pretty` option is not set explicitly, the module reads `LOG_PRETTY`. Only `true` and `1` enable pretty output; all other values keep it disabled.

When enabled, the module configures a default `pino-pretty` transport automatically. If you also provide `pinoHttp.transport`, the explicit transport takes precedence.

`@Log()` logs also include:

- `event`
- `className`
- `methodName`
- `status`
- `durationMs`
- `args`
- `result`
- `errorName`
- `errorMessage`

## Redaction

The default redaction paths include:

- `password`
- `token`
- `accessToken`
- `refreshToken`
- `authorization`
- `headers.authorization`
- `headers.cookie`
- `phone`
- `mobile`
- `idCard`
- `identityNo`

The module also masks Chinese mobile numbers and Chinese ID card numbers found inside strings.

```ts
LoggerModule.forRoot({
  redaction: {
    censor: "[Redacted]",
    paths: ["user.secret", "payload.bankCard"],
  },
});
```

Disable redaction completely:

```ts
LoggerModule.forRoot({
  redaction: {
    enabled: false,
  },
});
```

## @Log()

`@Log()` records method arguments, return values, and duration by default. Values are redacted before they are written.

```ts
import { Injectable } from "@nestjs/common";
import { Log } from "@raytonx/nest-logger";

@Injectable()
export class UsersService {
  @Log()
  async createUser(input: CreateUserInput): Promise<UserDto> {
    return this.usersRepository.create(input);
  }
}
```

Per-method overrides:

```ts
@Log({
  includeResult: false,
  level: "debug",
  message: "user profile refreshed",
  redaction: {
    paths: ["profile.email"],
  },
})
async refreshProfile(userId: string): Promise<UserProfile> {
  return this.profileClient.refresh(userId);
}
```

## Async Registration

```ts
LoggerModule.forRootAsync({
  useFactory: () => ({
    isGlobal: true,
    service: process.env.SERVICE_NAME,
    env: process.env.NODE_ENV,
    level: process.env.LOG_LEVEL ?? "info",
  }),
});
```

## Exports

- `LoggerModule`
- `LoggerService`
- `Log`
- Logger module options, constants, and utility functions
