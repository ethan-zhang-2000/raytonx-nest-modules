import { createInjectionToken } from "@raytonx/core";

export const RESPONSE_PACKAGE_NAME = "@raytonx/nest-response";
export const RESPONSE_MODULE_OPTIONS = createInjectionToken(
  RESPONSE_PACKAGE_NAME,
  "module-options",
);

export const DEFAULT_SUCCESS_CODE = "OK";
export const DEFAULT_SUCCESS_MESSAGE = "success";
export const DEFAULT_ERROR_CODE = "INTERNAL_SERVER_ERROR";
export const DEFAULT_ERROR_MESSAGE = "Internal server error";
export const UNKNOWN_ERROR_CODE = "UNKNOWN_ERROR";
