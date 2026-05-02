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

当前初始化阶段只使用：

- `PORT`：HTTP 服务端口，默认 `3000`
- `SERVICE_NAME`：健康检查返回的服务名，默认 `raytonx-example`

`REDIS_URL` 和 `LOG_LEVEL` 会在后续接入 RaytonX 模块时使用。

## 运行

```bash
pnpm dev
```

访问：

```bash
curl http://localhost:3000/health
```

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
