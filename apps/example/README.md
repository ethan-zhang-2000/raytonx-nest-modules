# RaytonX Example App

这是一个独立的 NestJS 示例应用，用于后续演示 RaytonX Nest packages 的真实安装与集成方式。

本应用不属于仓库根目录 pnpm workspace。请进入当前目录后再执行安装、运行、构建和测试命令。

English version: [README.en.md](README.en.md)

## 要求

- Node.js 20+
- pnpm 10+
- Redis 7+，用于 Redis 与 scheduler 分布式锁示例

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

启动 Redis：

```bash
docker run --rm -p 6379:6379 redis:7-alpine
```

启动示例应用：

```bash
pnpm dev
```

`pnpm dev` 会先使用 `tsc` 编译，再运行 `node --watch dist/main.js`，示例代码与生产构建后的运行方式保持一致。

如果 Redis 未启动或 `REDIS_URL` 不可连接，应用会在启动阶段报错，并提示先启动 Redis。这个检查由 `RedisStartupProbe` 完成，用于避免 scheduler Redis 锁示例在 Redis 不可用时静默降级。

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

### `@raytonx/nest-response`

示例内容：

- 在 `AppModule` 中通过 `ResponseModule.forRoot({ isGlobal: true })` 注册全局响应转换拦截器与异常过滤器。
- 普通 controller 返回值会自动包装为统一响应结构。
- 已经通过 `ResponseBuilder.success()` 构建的 envelope 不会被重复包装。
- 抛出的 `BadRequestException` 会被统一转换为错误响应结构。

查看方式：

```bash
curl http://localhost:3000/response/success
curl http://localhost:3000/response/manual
curl http://localhost:3000/response/error
```

验证重点：

- `/response/success` 返回的数据会自动包装为 `{ success, code, message, data }` 结构。
- `/response/manual` 会保留 `ResponseBuilder.success()` 生成的自定义 `code` 和 `message`。
- `/response/error` 会返回 `400`，并被包装为统一错误响应，而不是默认 Nest 异常体。

### `@raytonx/nest-scheduler`

示例内容：

- 在 `AppModule` 中注册 `ScheduleModule.forRoot()` 和 `SchedulerModule.forRoot()`。
- 使用 `redis` driver 演示跨进程分布式锁。
- 通过 `@raytonx/nest-redis` 连接 `REDIS_URL`，并复用 Redis lock 配置。
- 在 `SchedulerDemoService` 中注册三个任务：
  - `redis-heartbeat`：每 10 秒执行一次，每次持有 Redis 锁约 4 秒，方便在多个进程之间稳定观察锁争用。
  - `redis-failure`：每 20 秒执行一次，先持有 Redis 锁约 6 秒，再故意抛错，方便在多个进程之间观察争锁和失败日志。
  - `redis-ttl-expiry`：每 20 秒执行一次，锁 TTL 为 2 秒，任务执行 8 秒，并关闭自动续期，方便在多个进程之间先观察争锁，再观察锁超时或释放失败日志。

查看方式：

```bash
curl http://localhost:3000/scheduler/status
```

验证重点：

- `instanceId` 是当前 Node.js 进程 pid，可用于区分多个进程。
- `redisLockKeys` 展示本示例使用的 Redis 锁 key。
- `redis-heartbeat` 的 `runCount` 只会在当前进程成功拿到锁时递增。
- `redis-failure` 和 `redis-ttl-expiry` 也只会在当前进程成功拿到锁时递增；另一个进程在同一轮会记录 `task_skipped`。
- `redis-failure` 的 `lastError` 会记录故意抛出的错误。
- `redis-ttl-expiry` 会运行超过锁 TTL，控制台可观察锁过期或释放失败相关日志。

多进程验证：

```bash
PORT=3000 pnpm start
PORT=3001 pnpm start
```

两个进程使用同一个 `REDIS_URL` 时，三个任务都应只由其中一个进程执行。分别访问两个端口的 `/scheduler/status`，可以看到某一轮里只有一个进程的对应任务 `runCount` 递增，而另一个进程在同一轮不会递增；同时两个进程各自的控制台日志中会看到对应的 `task_succeeded`、`task_failed`、`task_skipped` 和 `lock_expired_before_finish` 记录。

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
