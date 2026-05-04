import type { AsyncModuleOptions } from "@raytonx/core";

export type LoggerLevel = "debug" | "error" | "fatal" | "info" | "silent" | "trace" | "warn";
export type LoggerLogStatus = "failed" | "success";

export interface LoggerRedactionOptions {
  enabled?: boolean;
  censor?: string;
  paths?: string[];
  maskPatterns?: boolean;
}

export interface LoggerDecoratorDefaults {
  enabled?: boolean;
  includeArgs?: boolean;
  includeResult?: boolean;
  maxDepth?: number;
  maxStringLength?: number;
}

export interface LoggerModuleOptions {
  global?: boolean;
  isGlobal?: boolean;
  service?: string;
  env?: string;
  level?: LoggerLevel | string;
  pretty?: boolean;
  requestIdHeader?: string;
  traceIdHeader?: string;
  generateId?: () => string;
  redaction?: LoggerRedactionOptions;
  logDecorator?: LoggerDecoratorDefaults;
  pinoHttp?: Record<string, unknown>;
}

export type LoggerModuleAsyncOptions = AsyncModuleOptions<LoggerModuleOptions> &
  Pick<LoggerModuleOptions, "global" | "isGlobal">;

export interface NormalizedLoggerRedactionOptions {
  censor: string;
  enabled: boolean;
  maskPatterns: boolean;
  paths: string[];
}

export interface NormalizedLoggerDecoratorOptions {
  enabled: boolean;
  includeArgs: boolean;
  includeResult: boolean;
  maxDepth: number;
  maxStringLength: number;
}

export interface NormalizedLoggerModuleOptions {
  env: string;
  generateId: () => string;
  global: boolean;
  isGlobal: boolean;
  level: string;
  pretty: boolean;
  logDecorator: NormalizedLoggerDecoratorOptions;
  pinoHttp: Record<string, unknown>;
  redaction: NormalizedLoggerRedactionOptions;
  requestIdHeader: string;
  service: string;
  traceIdHeader: string;
}

export interface LogOptions extends Partial<LoggerDecoratorDefaults> {
  level?: LoggerLevel | string;
  message?: string;
  redaction?: LoggerRedactionOptions;
}

export interface LoggerMethodLogEntry {
  args: unknown[] | undefined;
  className: string;
  durationMs: number;
  errorMessage: string | undefined;
  errorName: string | undefined;
  event: "method_failed" | "method_succeeded";
  methodName: string;
  result: unknown;
  status: LoggerLogStatus;
}
