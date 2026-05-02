import { createKeyv } from "@keyv/redis";
import type { CacheModuleOptions as NestCacheModuleOptions } from "@nestjs/cache-manager";

import type { CacheModuleOptions } from "./cache.interfaces";

export function createNestCacheOptions(options: CacheModuleOptions = {}): NestCacheModuleOptions {
  const { global, isGlobal, store, ...rest } = options;
  const nestOptions: NestCacheModuleOptions = { ...rest };
  const resolvedGlobal = isGlobal ?? global;

  if (resolvedGlobal !== undefined) {
    nestOptions.isGlobal = resolvedGlobal;
  }

  if (store?.type === "redis") {
    return {
      ...nestOptions,
      stores: [createKeyv(store.url)],
    };
  }

  return nestOptions;
}
