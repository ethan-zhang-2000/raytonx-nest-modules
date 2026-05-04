import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@raytonx/config";
import { Logger } from "nestjs-pino";
import "reflect-metadata";

import { AppModule } from "./app.module";
import type { AppConfig } from "./config.schema";
import { RedisStartupProbe } from "./redis-startup.probe";

async function bootstrap(): Promise<void> {
  let app: INestApplication | undefined;

  try {
    app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });
    const config = app.get(ConfigService<AppConfig>);
    const port = config.getOrThrow("PORT");

    app.useLogger(app.get(Logger));
    app.enableShutdownHooks();
    app.flushLogs();

    await app.get(RedisStartupProbe).assertReady();
    await app.listen(port);
  } catch (error) {
    if (app) {
      await closeAppAfterStartupFailure(app);
    }

    const message = error instanceof Error ? error.stack || error.message : String(error);

    console.error(message);
    process.exit(1);
  }
}

void bootstrap();

async function closeAppAfterStartupFailure(app: INestApplication): Promise<void> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  await Promise.race([
    app.close().catch(() => undefined),
    new Promise<void>((resolve) => {
      timeout = setTimeout(resolve, 1_000);
    }),
  ]).finally(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
}
