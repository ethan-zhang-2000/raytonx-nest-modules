import { describe, expect, it } from "vitest";

import { CACHE_MODULE_OPTIONS } from "./cache.constants";
import { CacheModule } from "./cache.module";
import { CacheService } from "./cache.service";

describe("CacheModule", () => {
  it("maps isGlobal to the Nest dynamic module global option", () => {
    const dynamicModule = CacheModule.forRoot({
      isGlobal: true,
    });

    expect(dynamicModule.global).toBe(true);
  });

  it("provides cache module options and CacheService", () => {
    const dynamicModule = CacheModule.forRoot({
      ttl: 1_000,
    });

    expect(dynamicModule.providers).toContainEqual({
      provide: CACHE_MODULE_OPTIONS,
      useValue: {
        ttl: 1_000,
      },
    });
    expect(dynamicModule.providers).toContain(CacheService);
    expect(dynamicModule.exports).toContain(CacheService);
  });

  it("supports async factory options", () => {
    const dynamicModule = CacheModule.forRootAsync({
      isGlobal: true,
      useFactory: () => ({
        ttl: 1_000,
      }),
    });

    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.providers).toContain(CacheService);
    expect(dynamicModule.imports).toHaveLength(1);
  });

  it("requires an async options source", () => {
    expect(() => CacheModule.forRootAsync({})).toThrow(
      "CacheModule.forRootAsync requires useFactory, useClass, or useExisting.",
    );
  });
});
