# @raytonx/nest-cache

基于 Nest 官方 `@nestjs/cache-manager` 的缓存模块与工具服务。

English version: [README.en.md](README.en.md)

## 安装

```bash
pnpm add @raytonx/nest-cache
```

```bash
npm i @raytonx/nest-cache
```

```bash
yarn add @raytonx/nest-cache
```

## 快速开始

注册内存缓存：

```ts
import { Module } from "@nestjs/common";
import { CacheModule } from "@raytonx/nest-cache";

@Module({
  imports: [
    CacheModule.forRoot({
      isGlobal: true,
      ttl: 5_000,
    }),
  ],
})
export class AppModule {}
```

在服务中使用 `CacheService`：

```ts
import { Injectable } from "@nestjs/common";
import { CacheService } from "@raytonx/nest-cache";

@Injectable()
export class UsersService {
  constructor(private readonly cache: CacheService) {}

  findProfile(userId: string) {
    return this.cache.wrap(`users:${userId}`, () => this.loadProfile(userId), 5_000);
  }

  private async loadProfile(userId: string) {
    return { id: userId };
  }
}
```

## Redis

Redis 使用 `@keyv/redis`，连接由官方 cache-manager/Keyv store 维护。

```ts
CacheModule.forRoot({
  isGlobal: true,
  store: {
    type: "redis",
    url: "redis://localhost:6379",
  },
  ttl: 5_000,
});
```

## forRootAsync

```ts
CacheModule.forRootAsync({
  useFactory: () => ({
    store: {
      type: "redis",
      url: process.env.REDIS_URL ?? "redis://localhost:6379",
    },
    ttl: 5_000,
  }),
});
```

## CacheService

- `get<T>(key)`：读取缓存，未命中时返回 `undefined`。
- `set<T>(key, value, ttl?)`：写入缓存，`ttl` 单位为毫秒。
- `del(key)`：删除缓存。
- `clear()`：清空当前 cache-manager store。
- `has(key)`：判断缓存是否存在。
- `wrap<T>(key, factory, ttl?)`：命中时返回缓存，未命中时执行 `factory` 并写入缓存。

## 官方缓存能力

本包重新导出 Nest 官方缓存能力，可以直接从 `@raytonx/nest-cache` 引入：

```ts
import { CacheInterceptor, CacheKey, CacheTTL } from "@raytonx/nest-cache";
```

## 导出内容

- `CacheModule`
- `CacheService`
- `CACHE_MODULE_OPTIONS`
- `CacheModuleOptions`
- `CacheModuleAsyncOptions`
- `NestCacheModule`
- `CACHE_MANAGER`
- `CacheInterceptor`
- `CacheKey`
- `CacheTTL`
- `Cache`
