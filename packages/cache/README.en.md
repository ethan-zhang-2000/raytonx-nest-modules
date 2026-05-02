# @raytonx/nest-cache

Cache module and helper service built on Nest's official `@nestjs/cache-manager`.

Chinese version: [README.md](README.md)

## Installation

```bash
pnpm add @raytonx/nest-cache
```

```bash
npm i @raytonx/nest-cache
```

```bash
yarn add @raytonx/nest-cache
```

## Quick Start

Register in-memory caching:

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

Use `CacheService` in a provider:

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

Redis uses `@keyv/redis`; the official cache-manager/Keyv store owns the connection lifecycle.

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

- `get<T>(key)` - reads a cached value and returns `undefined` on cache miss.
- `set<T>(key, value, ttl?)` - writes a cached value. `ttl` is in milliseconds.
- `del(key)` - deletes a cached value.
- `clear()` - clears the current cache-manager store.
- `has(key)` - checks whether a cached value exists.
- `wrap<T>(key, factory, ttl?)` - returns the cached value on hit, otherwise runs `factory` and stores the result.

## Official Cache Features

This package re-exports Nest's official cache features, so they can be imported from `@raytonx/nest-cache`:

```ts
import { CacheInterceptor, CacheKey, CacheTTL } from "@raytonx/nest-cache";
```

## Exports

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
