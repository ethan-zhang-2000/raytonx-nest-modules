import type { CacheModuleOptions as NestCacheModuleOptions } from "@nestjs/cache-manager";
import type { AsyncModuleOptions } from "@raytonx/core";

export interface CacheMemoryStoreOptions {
  type: "memory";
}

export interface CacheRedisStoreOptions {
  type: "redis";
  url: string;
}

export type CacheStoreOptions = CacheMemoryStoreOptions | CacheRedisStoreOptions;

export type CacheModuleOptions = Omit<NestCacheModuleOptions, "isGlobal" | "store"> & {
  global?: boolean;
  isGlobal?: boolean;
  store?: CacheStoreOptions;
};

export type CacheModuleAsyncOptions = AsyncModuleOptions<CacheModuleOptions> &
  Pick<CacheModuleOptions, "global" | "isGlobal">;
