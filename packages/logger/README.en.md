# @raytonx/nest-logger

Structured logging module for NestJS applications, powered by Pino and `nestjs-pino`.

Chinese version: [README.md](README.md)

## Installation

```bash
pnpm add @raytonx/nest-logger nestjs-pino pino pino-http
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
