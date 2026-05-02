import { z } from "zod";

export const appConfigSchema = z.object({
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  REDIS_URL: z.url().default("redis://127.0.0.1:6379"),
  SERVICE_NAME: z.string().min(1).default("raytonx-example"),
});

export type AppConfig = z.infer<typeof appConfigSchema>;
