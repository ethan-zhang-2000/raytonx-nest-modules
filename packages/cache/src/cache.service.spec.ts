import type { Cache } from "cache-manager";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CacheService } from "./cache.service";

describe("CacheService", () => {
  let cache: Cache;
  let service: CacheService;

  beforeEach(() => {
    cache = {
      clear: vi.fn(async () => true),
      del: vi.fn(async () => true),
      get: vi.fn(async () => null),
      set: vi.fn(async (_key: string, value: unknown) => value),
    } as unknown as Cache;
    service = new CacheService(cache);
  });

  it("normalizes cache misses to undefined", async () => {
    await expect(service.get("missing")).resolves.toBeUndefined();
  });

  it("sets a value with an optional ttl", async () => {
    await service.set("user:1", { id: 1 }, 1_000);

    expect(cache.set).toHaveBeenCalledWith("user:1", { id: 1 }, 1_000);
  });

  it("deletes and clears cache entries", async () => {
    await service.del("user:1");
    await service.clear();

    expect(cache.del).toHaveBeenCalledWith("user:1");
    expect(cache.clear).toHaveBeenCalled();
  });

  it("checks whether a value exists", async () => {
    vi.mocked(cache.get).mockResolvedValueOnce("cached");

    await expect(service.has("user:1")).resolves.toBe(true);
    await expect(service.has("missing")).resolves.toBe(false);
  });

  it("returns cached values from wrap without calling the factory", async () => {
    const factory = vi.fn(async () => "fresh");
    vi.mocked(cache.get).mockResolvedValueOnce("cached");

    await expect(service.wrap("user:1", factory)).resolves.toBe("cached");

    expect(factory).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it("stores factory results from wrap on cache miss", async () => {
    const factory = vi.fn(async () => "fresh");

    await expect(service.wrap("user:1", factory, 1_000)).resolves.toBe("fresh");

    expect(factory).toHaveBeenCalled();
    expect(cache.set).toHaveBeenCalledWith("user:1", "fresh", 1_000);
  });
});
