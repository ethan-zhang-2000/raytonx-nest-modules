declare module "nestjs-pino" {
  import type { DynamicModule } from "@nestjs/common";

  export class Logger {
    log(message: unknown, context?: string): void;
    error(message: unknown, trace?: string, context?: string): void;
    warn(message: unknown, context?: string): void;
    debug(message: unknown, context?: string): void;
    verbose(message: unknown, context?: string): void;
  }

  export class LoggerModule {
    static forRoot(options?: Record<string, unknown>): DynamicModule;
    static forRootAsync(options: Record<string, unknown>): DynamicModule;
  }
}
