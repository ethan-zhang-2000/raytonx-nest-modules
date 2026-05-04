---
"@raytonx/nest-logger": minor
---

Add optional pretty console log support through the `pretty` option or the `LOG_PRETTY` environment variable.

The logger now configures a default `pino-pretty` transport when pretty output is enabled, while keeping JSON structured logs as the default output format.
