import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import type { Cache } from "cache-manager";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<TValue>(key: string): Promise<TValue | undefined> {
    const value = await this.cache.get<TValue>(key);

    return value ?? undefined;
  }

  async set<TValue>(key: string, value: TValue, ttl?: number): Promise<void> {
    await this.cache.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== undefined;
  }

  async wrap<TValue>(
    key: string,
    factory: () => TValue | Promise<TValue>,
    ttl?: number,
  ): Promise<TValue> {
    const cached = await this.get<TValue>(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);

    return value;
  }
}
