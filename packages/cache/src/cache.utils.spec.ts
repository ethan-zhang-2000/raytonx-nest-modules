import { describe, expect, it } from "vitest";

import { createNestCacheOptions } from "./cache.utils";

describe("createNestCacheOptions", () => {
  it("maps global to the Nest cache isGlobal option", () => {
    expect(createNestCacheOptions({ global: true })).toEqual({
      isGlobal: true,
    });
  });

  it("uses isGlobal before global", () => {
    expect(createNestCacheOptions({ global: false, isGlobal: true })).toEqual({
      isGlobal: true,
    });
  });

  it("passes through cache-manager options", () => {
    expect(
      createNestCacheOptions({
        nonBlocking: true,
        ttl: 1_000,
      }),
    ).toEqual({
      nonBlocking: true,
      ttl: 1_000,
    });
  });

  it("creates a redis store from a redis url", () => {
    const options = createNestCacheOptions({
      store: {
        type: "redis",
        url: "redis://localhost:6379",
      },
    });

    expect(options.stores).toHaveLength(1);
  });
});
