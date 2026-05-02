import { Controller, Get, Inject } from "@nestjs/common";
import { ConfigService } from "@raytonx/config";

import type { AppConfig } from "./config.schema";

interface ConfigResponse {
  logLevel: AppConfig["LOG_LEVEL"];
  nodeEnv: AppConfig["NODE_ENV"];
  port: AppConfig["PORT"];
  redisUrl: AppConfig["REDIS_URL"];
  serviceName: AppConfig["SERVICE_NAME"];
}

@Controller("config")
export class ConfigController {
  constructor(@Inject(ConfigService) private readonly config: ConfigService<AppConfig>) {}

  @Get()
  getConfig(): ConfigResponse {
    return {
      logLevel: this.config.getOrThrow("LOG_LEVEL"),
      nodeEnv: this.config.getOrThrow("NODE_ENV"),
      port: this.config.getOrThrow("PORT"),
      redisUrl: this.config.getOrThrow("REDIS_URL"),
      serviceName: this.config.getOrThrow("SERVICE_NAME"),
    };
  }
}
