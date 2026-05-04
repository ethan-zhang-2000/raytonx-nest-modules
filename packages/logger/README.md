# @raytonx/nest-logger

用于 NestJS 应用的结构化日志模块，基于 Pino 与 `nestjs-pino`。

English version: [README.en.md](README.en.md)

## 安装

```bash
pnpm add @raytonx/nest-logger nestjs-pino pino pino-http
```

如果需要 pretty 控制台日志，再额外安装：

```bash
pnpm add pino-pretty
```

## 功能边界

- 使用 Pino 替换 Nest 默认 Logger
- 自动注入并传递 `requestId` / `traceId`
- 固定输出 `service`、`env`、`level` 等结构化字段
- 自动脱敏常见敏感字段、手机号和身份证号
- 提供 `@Log()` 装饰器记录方法入参、出参、耗时与异常

## 快速开始

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

在 `main.ts` 中替换 Nest 默认 Logger：

```ts
import { Logger } from "nestjs-pino";

const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});

app.useLogger(app.get(Logger));
app.flushLogs();
```

## 请求 ID

默认读取并写回：

- `x-request-id`
- `x-trace-id`

如果请求未携带对应 header，会自动生成 ID。未提供 `x-trace-id` 时，默认复用 `requestId`。

如果需要自定义 header 名称，例如接入已有网关、链路追踪系统或公司统一规范，可以通过 `requestIdHeader` 和 `traceIdHeader` 覆盖默认值：

```ts
LoggerModule.forRoot({
  requestIdHeader: "x-correlation-id",
  traceIdHeader: "traceparent",
});
```

## 标准日志字段

默认日志会包含：

- `service`
- `env`
- `level`
- `requestId`
- `traceId`

## Pretty 输出

模块支持通过 `LOG_PRETTY` 启用更适合本地阅读的控制台日志输出，默认关闭。推荐做法是不在业务代码里显式配置 pretty，而是在包脚本中按运行方式临时注入环境变量：`pnpm dev` 通常用于本地开发，适合开启 pretty；其他场景默认保持 JSON 序列化后的结构化日志输出。

推荐脚本写法：

```json
{
  "scripts": {
    "dev": "LOG_PRETTY=1 node dist/main.js",
    "start": "node dist/main.js"
  }
}
```

也可以直接通过命令行环境变量控制：

```bash
LOG_PRETTY=1 pnpm dev
```

模块在未显式传入 `pretty` 选项时，会读取 `LOG_PRETTY`。只有 `true` 和 `1` 会启用 pretty 输出，其余值都视为关闭。

启用后，模块会自动为 `pino` 配置默认的 `pino-pretty` transport；如果同时传入了 `pinoHttp.transport`，则以显式传入的 transport 为准。

`@Log()` 装饰器日志额外包含：

- `event`
- `className`
- `methodName`
- `status`
- `durationMs`
- `args`
- `result`
- `errorName`
- `errorMessage`

## 脱敏

默认会脱敏常见字段：

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

同时会识别字符串中的中国大陆手机号和身份证号。

```ts
LoggerModule.forRoot({
  redaction: {
    censor: "[Redacted]",
    paths: ["user.secret", "payload.bankCard"],
  },
});
```

如需完全关闭脱敏：

```ts
LoggerModule.forRoot({
  redaction: {
    enabled: false,
  },
});
```

## @Log()

`@Log()` 默认记录方法入参、出参和耗时，并在记录前执行脱敏。

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

方法级覆盖：

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

## 异步注册

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

## 导出内容

- `LoggerModule`
- `LoggerService`
- `Log`
- 日志模块 options、常量与工具函数
