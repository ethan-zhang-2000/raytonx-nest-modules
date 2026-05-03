# RaytonX Example App

这是一个独立的 NestJS 示例应用，用于后续演示 RaytonX Nest packages 的真实安装与集成方式。

本应用不属于仓库根目录 pnpm workspace。请进入当前目录后再执行安装、运行、构建和测试命令。

English version: [README.en.md](README.en.md)

## 要求

- Node.js 20+
- pnpm 10+

## 安装

```bash
cd apps/example
pnpm install
```

## 环境变量

复制示例环境文件：

```bash
cp .env.example .env
```

当前配置由 `@raytonx/config` 加载，并通过 Zod schema 校验和转换：

- `NODE_ENV`：运行环境，默认 `development`
- `PORT`：HTTP 服务端口，默认 `3000`
- `REDIS_URL`：Redis 连接地址，默认 `redis://127.0.0.1:6379`
- `SERVICE_NAME`：健康检查返回的服务名，默认 `raytonx-example`
- `LOG_LEVEL`：日志级别，默认 `info`

`envFilePath: "auto"` 会按当前工作目录加载 `.env`、`.env.local`、`.env.${NODE_ENV}`、`.env.${NODE_ENV}.local`。

## 运行

```bash
pnpm dev
```

`pnpm dev` 会先使用 `tsc` 编译，再运行 `node --watch dist/main.js`，示例代码与生产构建后的运行方式保持一致。

基础健康检查：

```bash
curl http://localhost:3000/health
```

## 示例模块

### `@raytonx/config`

示例内容：

- 在 `AppModule` 中通过 `ConfigModule.forRoot` 注册全局配置模块。
- 使用 `envFilePath: "auto"` 加载当前目录下的 env 文件。
- 使用 Zod schema 校验和转换配置值。
- 在 `ConfigController` 和 `HealthController` 中通过 `ConfigService` 读取配置。

查看方式：

```bash
curl http://localhost:3000/config
```

验证重点：

- `port` 会被转换为 number。
- `serviceName` 会来自 `SERVICE_NAME` 或默认值。
- 返回值展示的是校验和转换后的配置，而不是原始字符串环境变量。

### `@raytonx/nest-logger`

示例内容：

- 在 `AppModule` 中通过 `LoggerModule.forRootAsync` 注册日志模块。
- 从 `ConfigService` 读取 `NODE_ENV`、`SERVICE_NAME` 和 `LOG_LEVEL`。
- 在 `main.ts` 中通过 `app.useLogger(app.get(Logger))` 接管 Nest logger。
- 在 `LoggerDemoService` 中使用 `@Log()` 记录方法级日志。

查看方式：

```bash
curl http://localhost:3000/logger/demo
```

验证重点：

- 控制台会输出 Pino 结构化请求日志。
- `@Log()` 会输出方法执行事件、耗时、参数和返回值。
- 示例参数中的 `password`、`token` 会被脱敏。

### `@raytonx/nest-scheduler`

示例内容：

- 在 `AppModule` 中注册 `ScheduleModule.forRoot()` 和 `SchedulerModule.forRoot()`。
- 使用 `memory` driver 演示无 Redis 依赖的进程内锁。
- 在 `SchedulerDemoService` 中使用 `@DistributedInterval` 注册一个每 30 秒执行一次的任务。
- 任务记录执行次数和上次执行时间。

查看方式：

```bash
curl http://localhost:3000/scheduler/status
```

验证重点：

- `runCount` 会随定时任务执行递增。
- `lastRunAt` 会在任务执行后变成 ISO 时间字符串。
- 控制台会输出任务开始、锁获取、执行完成和锁释放等 verbose 调度日志。

## 构建与启动

```bash
pnpm build
pnpm start
```

## E2E 测试

```bash
pnpm test:e2e
```

当前步骤只初始化测试配置，后续接入 RaytonX 模块时会补充 E2E 用例。
