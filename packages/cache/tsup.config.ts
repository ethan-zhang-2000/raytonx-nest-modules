import baseConfig from "../../tsup.config";

export default {
  ...baseConfig,
  external: [
    "@keyv/redis",
    "@nestjs/cache-manager",
    "@nestjs/common",
    "@raytonx/core",
    "cache-manager",
  ],
};
