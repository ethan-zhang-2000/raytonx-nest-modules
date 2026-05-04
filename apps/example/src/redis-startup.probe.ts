import { Injectable, type OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@raytonx/config";
import { RedisService } from "@raytonx/nest-redis";
import type Redis from "ioredis";

import type { AppConfig } from "./config.schema";

const REDIS_STARTUP_PING_TIMEOUT_MS = 3_000;

@Injectable()
export class RedisStartupProbe implements OnApplicationBootstrap {
  private readyPromise?: Promise<void>;

  constructor(
    private readonly config: ConfigService<AppConfig>,
    private readonly redisService: RedisService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.assertReady();
  }

  async assertReady(): Promise<void> {
    this.readyPromise ??= this.verifyRedisConnection();

    await this.readyPromise;
  }

  private async verifyRedisConnection(): Promise<void> {
    const redisUrl = this.config.getOrThrow("REDIS_URL");
    const client = this.redisService.getClient();

    try {
      await this.pingWithTimeout(client);
    } catch (error) {
      client.disconnect(false);

      const message = error instanceof Error ? error.message : String(error);
      const startupError = new Error(
        `Redis is required for this example app. Could not connect to ${redisUrl}. ` +
          `Start Redis first, for example: docker run --rm -p 6379:6379 redis:7-alpine. ` +
          `Original error: ${message}`,
      ) as Error & { cause: unknown };

      startupError.cause = error;
      throw startupError;
    }
  }

  private async pingWithTimeout(client: Redis): Promise<void> {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    await Promise.race([
      client.ping().then(() => undefined),
      new Promise<void>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error(`Redis ping timed out after ${REDIS_STARTUP_PING_TIMEOUT_MS}ms.`));
        }, REDIS_STARTUP_PING_TIMEOUT_MS);
      }),
    ]).finally(() => {
      if (timeout) {
        clearTimeout(timeout);
      }
    });
  }
}
