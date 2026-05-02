import { createInjectionToken } from "@raytonx/core";

export const CACHE_PACKAGE_NAME = "@raytonx/nest-cache";
export const CACHE_MODULE_OPTIONS = createInjectionToken(CACHE_PACKAGE_NAME, "module-options");
