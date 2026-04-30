import { createInjectionToken } from "@raytonx/core";

export const LOGGER_MODULE_OPTIONS = createInjectionToken("nest-logger", "module-options");

export const DEFAULT_REQUEST_ID_HEADER = "x-request-id";
export const DEFAULT_TRACE_ID_HEADER = "x-trace-id";
export const DEFAULT_REDACTION_CENSOR = "[Redacted]";

export const DEFAULT_REDACTION_PATHS = [
  "password",
  "*.password",
  "token",
  "*.token",
  "accessToken",
  "*.accessToken",
  "refreshToken",
  "*.refreshToken",
  "authorization",
  "*.authorization",
  "headers.authorization",
  "headers.cookie",
  "phone",
  "*.phone",
  "mobile",
  "*.mobile",
  "idCard",
  "*.idCard",
  "identityNo",
  "*.identityNo",
];
