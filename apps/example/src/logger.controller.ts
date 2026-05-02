import { Controller, Get } from "@nestjs/common";

import { type LoggerDemoService } from "./logger-demo.service";

interface LoggerDemoResponse {
  action: string;
  message: string;
}

@Controller("logger")
export class LoggerController {
  constructor(private readonly loggerDemoService: LoggerDemoService) {}

  @Get("demo")
  getDemo(): LoggerDemoResponse {
    return this.loggerDemoService.createDemo({
      action: "demo",
      password: "secret-password",
      token: "secret-token",
    });
  }
}
