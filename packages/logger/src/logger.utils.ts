import { randomUUID } from "node:crypto";

import {
  DEFAULT_REDACTION_CENSOR,
  DEFAULT_REDACTION_PATHS,
  DEFAULT_REQUEST_ID_HEADER,
  DEFAULT_TRACE_ID_HEADER,
} from "./logger.constants";
import type {
  LoggerModuleOptions,
  LoggerRedactionOptions,
  NormalizedLoggerModuleOptions,
  NormalizedLoggerRedactionOptions,
} from "./logger.interfaces";

const PHONE_PATTERN = /(?<!\d)(1[3-9]\d)(\d{4})(\d{4})(?!\d)/g;
const ID_CARD_PATTERN = /(?<![0-9A-Za-z])(\d{6})(\d{8})(\d{3}[0-9Xx])(?![0-9A-Za-z])/g;
const DEFAULT_MAX_DEPTH = 6;
const DEFAULT_MAX_STRING_LENGTH = 2_000;

export function normalizeLoggerModuleOptions(
  options: LoggerModuleOptions = {},
): NormalizedLoggerModuleOptions {
  const redaction = normalizeRedactionOptions(options.redaction);

  return {
    env: options.env ?? process.env.NODE_ENV ?? "development",
    generateId: options.generateId ?? randomUUID,
    global: options.global ?? false,
    isGlobal: options.isGlobal ?? options.global ?? false,
    level: options.level ?? process.env.LOG_LEVEL ?? "info",
    logDecorator: {
      enabled: options.logDecorator?.enabled ?? true,
      includeArgs: options.logDecorator?.includeArgs ?? true,
      includeResult: options.logDecorator?.includeResult ?? true,
      maxDepth: options.logDecorator?.maxDepth ?? DEFAULT_MAX_DEPTH,
      maxStringLength: options.logDecorator?.maxStringLength ?? DEFAULT_MAX_STRING_LENGTH,
    },
    pinoHttp: options.pinoHttp ?? {},
    redaction,
    requestIdHeader: normalizeHeaderName(options.requestIdHeader ?? DEFAULT_REQUEST_ID_HEADER),
    service: options.service ?? process.env.SERVICE_NAME ?? "nestjs-app",
    traceIdHeader: normalizeHeaderName(options.traceIdHeader ?? DEFAULT_TRACE_ID_HEADER),
  };
}

export function normalizeRedactionOptions(
  options: LoggerRedactionOptions = {},
): NormalizedLoggerRedactionOptions {
  return {
    censor: options.censor ?? DEFAULT_REDACTION_CENSOR,
    enabled: options.enabled ?? true,
    maskPatterns: options.maskPatterns ?? true,
    paths: [...DEFAULT_REDACTION_PATHS, ...(options.paths ?? [])],
  };
}

export function createPinoHttpOptions(
  options: NormalizedLoggerModuleOptions,
): Record<string, unknown> {
  const userOptions = options.pinoHttp;
  const userCustomProps = userOptions.customProps;
  const userFormatters = getRecord(userOptions.formatters);
  const userLogFormatter = userFormatters ? userFormatters.log : undefined;

  return {
    ...userOptions,
    level: options.level,
    base: {
      ...getRecord(userOptions.base),
      env: options.env,
      service: options.service,
    },
    customAttributeKeys: {
      ...getRecord(userOptions.customAttributeKeys),
      reqId: "requestId",
    },
    customProps: (req: RequestLike, res: ResponseLike) => ({
      ...callCustomProps(userCustomProps, req, res),
      requestId: readRequestValue(req, "requestId"),
      traceId: ensureTraceId(req, res, options),
    }),
    formatters: {
      ...userFormatters,
      level: (label: string) => ({
        level: label,
      }),
      log: (entry: Record<string, unknown>) => {
        const formatted =
          typeof userLogFormatter === "function"
            ? (userLogFormatter as (value: Record<string, unknown>) => Record<string, unknown>)(
                entry,
              )
            : entry;

        return sanitizeLogValue(formatted, options.redaction, {
          maxDepth: options.logDecorator.maxDepth,
          maxStringLength: options.logDecorator.maxStringLength,
        }) as Record<string, unknown>;
      },
    },
    genReqId: (req: RequestLike, res: ResponseLike) => ensureRequestIds(req, res, options),
    redact: options.redaction.enabled
      ? {
          censor: options.redaction.censor,
          paths: options.redaction.paths,
        }
      : undefined,
  };
}

export function sanitizeLogValue(
  value: unknown,
  redaction: NormalizedLoggerRedactionOptions,
  limits: {
    maxDepth?: number;
    maxStringLength?: number;
  } = {},
): unknown {
  const seen = new WeakSet<object>();
  const maxDepth = limits.maxDepth ?? DEFAULT_MAX_DEPTH;
  const maxStringLength = limits.maxStringLength ?? DEFAULT_MAX_STRING_LENGTH;

  return sanitizeValue(value, redaction, {
    depth: 0,
    maxDepth,
    maxStringLength,
    path: [],
    seen,
  });
}

export function maskSensitiveText(value: string, censor: string): string {
  return value.replace(PHONE_PATTERN, `$1${censor}$3`).replace(ID_CARD_PATTERN, `$1${censor}$3`);
}

function sanitizeValue(
  value: unknown,
  redaction: NormalizedLoggerRedactionOptions,
  context: SanitizeContext,
): unknown {
  if (!redaction.enabled) {
    return trimString(value, context.maxStringLength);
  }

  if (shouldRedactPath(context.path, redaction.paths)) {
    return redaction.censor;
  }

  if (typeof value === "string") {
    const trimmed = trimString(value, context.maxStringLength) as string;

    return redaction.maskPatterns ? maskSensitiveText(trimmed, redaction.censor) : trimmed;
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (context.seen.has(value)) {
    return "[Circular]";
  }

  if (context.depth >= context.maxDepth) {
    return "[MaxDepth]";
  }

  context.seen.add(value);

  if (value instanceof Error) {
    return {
      message: sanitizeValue(value.message, redaction, {
        ...context,
        depth: context.depth + 1,
        path: [...context.path, "message"],
      }),
      name: value.name,
      stack: sanitizeValue(value.stack, redaction, {
        ...context,
        depth: context.depth + 1,
        path: [...context.path, "stack"],
      }),
    };
  }

  if (Array.isArray(value)) {
    return value.map((item, index) =>
      sanitizeValue(item, redaction, {
        ...context,
        depth: context.depth + 1,
        path: [...context.path, String(index)],
      }),
    );
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      sanitizeValue(item, redaction, {
        ...context,
        depth: context.depth + 1,
        path: [...context.path, key],
      }),
    ]),
  );
}

function shouldRedactPath(path: string[], patterns: string[]): boolean {
  if (path.length === 0) {
    return false;
  }

  return patterns.some((pattern) => matchesPath(path, pattern));
}

function matchesPath(path: string[], pattern: string): boolean {
  const parts = pattern.split(".").filter(Boolean);

  if (parts.length === 0 || parts.length > path.length) {
    return false;
  }

  const offset = path.length - parts.length;

  return parts.every((part, index) => {
    const normalizedPart = normalizePathPart(part);

    return (
      normalizedPart === "*" || normalizePathPart(path[offset + index] ?? "") === normalizedPart
    );
  });
}

function normalizePathPart(value: string): string {
  return value.replaceAll("[", ".").replaceAll("]", "").replaceAll('"', "").toLowerCase();
}

function trimString(value: unknown, maxStringLength: number): unknown {
  if (typeof value !== "string" || value.length <= maxStringLength) {
    return value;
  }

  return `${value.slice(0, maxStringLength)}...`;
}

function ensureRequestIds(
  req: RequestLike,
  res: ResponseLike,
  options: NormalizedLoggerModuleOptions,
): string {
  const existingRequestId =
    readHeader(req, options.requestIdHeader) ?? readRequestValue(req, "requestId");
  const requestId = existingRequestId ?? options.generateId();
  const traceId =
    readHeader(req, options.traceIdHeader) ?? readRequestValue(req, "traceId") ?? requestId;

  writeRequestValue(req, "requestId", requestId);
  writeRequestValue(req, "traceId", traceId);
  setHeaderIfMissing(res, options.requestIdHeader, requestId);
  setHeaderIfMissing(res, options.traceIdHeader, traceId);

  return requestId;
}

function ensureTraceId(
  req: RequestLike,
  res: ResponseLike,
  options: NormalizedLoggerModuleOptions,
): string {
  ensureRequestIds(req, res, options);

  return (
    readRequestValue(req, "traceId") ?? readRequestValue(req, "requestId") ?? options.generateId()
  );
}

function readHeader(req: RequestLike, headerName: string): string | undefined {
  const headers = req.headers ?? {};
  const value = headers[headerName] ?? headers[headerName.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function setHeaderIfMissing(res: ResponseLike, headerName: string, value: string): void {
  if (typeof res.getHeader === "function" && res.getHeader(headerName) !== undefined) {
    return;
  }

  res.setHeader?.(headerName, value);
}

function normalizeHeaderName(value: string): string {
  return value.toLowerCase();
}

function getRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function callCustomProps(
  customProps: unknown,
  req: RequestLike,
  res: ResponseLike,
): Record<string, unknown> {
  if (typeof customProps === "function") {
    return getRecord((customProps as (req: RequestLike, res: ResponseLike) => unknown)(req, res));
  }

  return getRecord(customProps);
}

function readRequestValue(req: RequestLike, key: "requestId" | "traceId"): string | undefined {
  const value = req[key] ?? req.raw?.[key];

  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function writeRequestValue(req: RequestLike, key: "requestId" | "traceId", value: string): void {
  req[key] = value;

  if (req.raw) {
    req.raw[key] = value;
  }
}

interface SanitizeContext {
  depth: number;
  maxDepth: number;
  maxStringLength: number;
  path: string[];
  seen: WeakSet<object>;
}

interface RequestLike {
  headers?: Record<string, string | string[] | undefined>;
  raw?: RequestLike;
  requestId?: string;
  traceId?: string;
}

interface ResponseLike {
  getHeader?: (name: string) => unknown;
  setHeader?: (name: string, value: string) => void;
}
