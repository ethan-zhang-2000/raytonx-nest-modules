import { Injectable } from "@nestjs/common";
import { Log } from "@raytonx/nest-logger";

interface LoggerDemoInput {
  action: string;
  password: string;
  token: string;
}

interface LoggerDemoResult {
  action: string;
  message: string;
}

@Injectable()
export class LoggerDemoService {
  @Log({
    message: "logger demo handled",
  })
  createDemo(input: LoggerDemoInput): LoggerDemoResult {
    return {
      action: input.action,
      message: "logger module is enabled",
    };
  }
}
