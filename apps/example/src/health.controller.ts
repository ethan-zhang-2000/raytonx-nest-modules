import { Controller, Get, Inject } from "@nestjs/common";
import { ConfigService } from "@raytonx/config";

import type { AppConfig } from "./config.schema";

interface HealthResponse {
  service: string;
  status: "ok";
}

@Controller("health")
export class HealthController {
  constructor(@Inject(ConfigService) private readonly config: ConfigService<AppConfig>) {}

  @Get()
  getHealth(): HealthResponse {
    return {
      service: this.config.getOrThrow("SERVICE_NAME"),
      status: "ok",
    };
  }
}
