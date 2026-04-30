import {
  Inject,
  Injectable,
  Logger,
  type LoggerService as NestLoggerService,
  Optional,
} from "@nestjs/common";
import type { Logger as NestPinoLogger } from "nestjs-pino";

import { LOGGER_MODULE_OPTIONS } from "./logger.constants";
import type {
  LogOptions,
  LoggerMethodLogEntry,
  LoggerModuleOptions,
  NormalizedLoggerModuleOptions,
} from "./logger.interfaces";
import { normalizeRedactionOptions, sanitizeLogValue } from "./logger.utils";

@Injectable()
export class LoggerService implements NestLoggerService {
  private static runtime: LoggerService | undefined;
  private readonly fallbackLogger = new Logger("LoggerModule");

  constructor(
    @Inject(LOGGER_MODULE_OPTIONS)
    private readonly moduleOptions: NormalizedLoggerModuleOptions,
    @Optional()
    private readonly pinoLogger?: NestPinoLogger,
  ) {
    LoggerService.runtime = this;
  }

  log(message: unknown, context?: string): void {
    this.write("log", message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write("error", message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.write("warn", message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write("debug", message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write("verbose", message, context);
  }

  fatal(message: unknown, context?: string): void {
    this.write("fatal", message, context);
  }

  executeLoggedMethod(context: {
    args: unknown[];
    className: string;
    instance: object;
    methodName: string;
    options: LogOptions;
    originalMethod: (...args: unknown[]) => unknown;
  }): unknown {
    const decoratorOptions = {
      ...this.moduleOptions.logDecorator,
      ...context.options,
    };

    if (!decoratorOptions.enabled) {
      return context.originalMethod.apply(context.instance, context.args);
    }

    const startedAt = Date.now();

    try {
      const result = context.originalMethod.apply(context.instance, context.args);

      if (isPromiseLike(result)) {
        return result.then(
          (resolved) => {
            this.logMethodResult(context, decoratorOptions, startedAt, resolved);

            return resolved;
          },
          (error) => {
            this.logMethodError(context, decoratorOptions, startedAt, error);
            throw error;
          },
        );
      }

      this.logMethodResult(context, decoratorOptions, startedAt, result);

      return result;
    } catch (error) {
      this.logMethodError(context, decoratorOptions, startedAt, error);
      throw error;
    }
  }

  static runLoggedMethod(context: {
    args: unknown[];
    className: string;
    instance: object;
    methodName: string;
    options: LogOptions;
    originalMethod: (...args: unknown[]) => unknown;
  }): unknown {
    if (!LoggerService.runtime) {
      return context.originalMethod.apply(context.instance, context.args);
    }

    return LoggerService.runtime.executeLoggedMethod(context);
  }

  private logMethodResult(
    context: Parameters<LoggerService["executeLoggedMethod"]>[0],
    options: Required<
      Pick<LogOptions, "includeArgs" | "includeResult" | "maxDepth" | "maxStringLength">
    > &
      LogOptions,
    startedAt: number,
    result: unknown,
  ): void {
    const entry = this.createMethodEntry(context, options, startedAt, {
      event: "method_succeeded",
      result,
      status: "success",
    });

    this.writeMethodLog(options.level ?? "info", entry, options.message);
  }

  private logMethodError(
    context: Parameters<LoggerService["executeLoggedMethod"]>[0],
    options: Required<
      Pick<LogOptions, "includeArgs" | "includeResult" | "maxDepth" | "maxStringLength">
    > &
      LogOptions,
    startedAt: number,
    error: unknown,
  ): void {
    const normalizedError = error instanceof Error ? error : new Error("Unknown logger error");
    const entry = this.createMethodEntry(context, options, startedAt, {
      errorMessage: normalizedError.message,
      errorName: normalizedError.name,
      event: "method_failed",
      result: undefined,
      status: "failed",
    });

    this.writeMethodLog(options.level ?? "error", entry, options.message);
  }

  private createMethodEntry(
    context: Parameters<LoggerService["executeLoggedMethod"]>[0],
    options: Required<
      Pick<LogOptions, "includeArgs" | "includeResult" | "maxDepth" | "maxStringLength">
    > &
      LogOptions,
    startedAt: number,
    extra: Pick<LoggerMethodLogEntry, "event" | "result" | "status"> &
      Partial<Pick<LoggerMethodLogEntry, "errorMessage" | "errorName">>,
  ): LoggerMethodLogEntry {
    const redaction = normalizeRedactionOptions({
      ...this.moduleOptions.redaction,
      ...options.redaction,
      paths: [...this.moduleOptions.redaction.paths, ...(options.redaction?.paths ?? [])],
    } satisfies LoggerModuleOptions["redaction"]);
    const limits = {
      maxDepth: options.maxDepth,
      maxStringLength: options.maxStringLength,
    };

    return {
      args: options.includeArgs
        ? (sanitizeLogValue(context.args, redaction, limits) as unknown[])
        : undefined,
      className: context.className,
      durationMs: Date.now() - startedAt,
      errorMessage:
        typeof extra.errorMessage === "string"
          ? (sanitizeLogValue(extra.errorMessage, redaction, limits) as string)
          : extra.errorMessage,
      errorName: extra.errorName,
      event: extra.event,
      methodName: context.methodName,
      result: options.includeResult ? sanitizeLogValue(extra.result, redaction, limits) : undefined,
      status: extra.status,
    };
  }

  private writeMethodLog(level: string, entry: LoggerMethodLogEntry, message?: string): void {
    const logger = this.pinoLogger as unknown as Record<string, unknown> | undefined;
    const method = normalizeLevelMethod(level);
    const payload = {
      ...entry,
      env: this.moduleOptions.env,
      service: this.moduleOptions.service,
    };

    if (logger && typeof logger[method] === "function") {
      (logger[method] as (payload: unknown, message?: string) => void)(
        payload,
        message ?? `${entry.className}.${entry.methodName}`,
      );
      return;
    }

    this.fallbackLogger.log(JSON.stringify(payload));
  }

  private write(
    method: LoggerWriteMethod,
    message: unknown,
    context?: string,
    trace?: string,
  ): void {
    const logger = this.pinoLogger as unknown as Record<string, unknown> | undefined;

    if (logger && typeof logger[method] === "function") {
      (logger[method] as (...args: unknown[]) => void)(message, trace ?? context);
      return;
    }

    const fallback = this.fallbackLogger as unknown as Record<string, unknown>;

    if (typeof fallback[method] === "function") {
      (fallback[method] as (...args: unknown[]) => void)(message, trace ?? context);
    }
  }
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof (value as { then: unknown }).then === "function"
  );
}

function normalizeLevelMethod(level: string): string {
  if (level === "info") {
    return "log";
  }

  if (level === "fatal") {
    return "error";
  }

  if (level === "trace") {
    return "debug";
  }

  return level;
}

type LoggerWriteMethod = "debug" | "error" | "fatal" | "log" | "verbose" | "warn";
