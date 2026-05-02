import { Controller, Get } from "@nestjs/common";

interface HealthResponse {
  service: string;
  status: "ok";
}

@Controller("health")
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      service: process.env.SERVICE_NAME ?? "raytonx-example",
      status: "ok",
    };
  }
}
