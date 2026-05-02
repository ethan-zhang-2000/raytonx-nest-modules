import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@raytonx/config";
import "reflect-metadata";

import { AppModule } from "./app.module";
import type { AppConfig } from "./config.schema";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppConfig>);
  const port = config.getOrThrow("PORT");

  app.enableShutdownHooks();

  await app.listen(port);
}

void bootstrap();
