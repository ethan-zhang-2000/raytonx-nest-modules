import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@raytonx/config";
import { Logger } from "nestjs-pino";
import "reflect-metadata";

import { AppModule } from "./app.module";
import type { AppConfig } from "./config.schema";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const config = app.get(ConfigService<AppConfig>);
  const port = config.getOrThrow("PORT");

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  app.flushLogs();

  await app.listen(port);
}

void bootstrap();
