import { Controller, Get } from "@nestjs/common";
import { type ConfigService } from "@raytonx/config";

import type { AppConfig } from "./config.schema";

interface HealthResponse {
  service: string;
  status: "ok";
}

@Controller("health")
export class HealthController {
  constructor(private readonly config: ConfigService<AppConfig>) {}

  @Get()
  getHealth(): HealthResponse {
    return {
      service: this.config.getOrThrow("SERVICE_NAME"),
      status: "ok",
    };
  }
}
