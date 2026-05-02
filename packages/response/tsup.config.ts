import baseConfig from "../../tsup.config";

export default {
  ...baseConfig,
  external: ["@nestjs/common", "@nestjs/core", "@raytonx/core", "rxjs"],
};
