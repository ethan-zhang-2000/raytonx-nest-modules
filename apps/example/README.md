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

访问：

```bash
curl http://localhost:3000/health
curl http://localhost:3000/config
```

`GET /config` 会返回经 `@raytonx/config` 校验和转换后的配置值。

日志模块也已启用：

```bash
curl http://localhost:3000/logger/demo
```

`@raytonx/nest-logger` 会接管 Nest logger，输出 Pino 结构化请求日志。`GET /logger/demo` 会调用一个带 `@Log()` 的 service 方法，日志中会展示方法级事件，并对 `password`、`token` 等敏感字段脱敏。

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
