import { NestFactory } from "@nestjs/core";
import "reflect-metadata";

import { AppModule } from "./app.module";

function resolvePort(value: string | undefined): number {
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = resolvePort(process.env.PORT);

  app.enableShutdownHooks();

  await app.listen(port);
}

void bootstrap();
