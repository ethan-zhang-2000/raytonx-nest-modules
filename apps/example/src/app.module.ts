import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule, ConfigService } from "@raytonx/config";
import { LoggerModule } from "@raytonx/nest-logger";
import { RedisModule } from "@raytonx/nest-redis";
import { ResponseModule } from "@raytonx/nest-response";
import { SchedulerModule } from "@raytonx/nest-scheduler";

import { ConfigController } from "./config.controller";
import { type AppConfig, appConfigSchema } from "./config.schema";
import { HealthController } from "./health.controller";
import { LoggerDemoService } from "./logger-demo.service";
import { LoggerController } from "./logger.controller";
import { RedisStartupProbe } from "./redis-startup.probe";
import { ResponseController } from "./response.controller";
import { SchedulerDemoService } from "./scheduler-demo.service";
import { SchedulerController } from "./scheduler.controller";

@Module({
  imports: [
    ConfigModule.forRoot<AppConfig>({
      envFilePath: "auto",
      isGlobal: true,
      schema: appConfigSchema,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService) => {
        const config = configService as ConfigService<AppConfig>;

        return {
          env: config.getOrThrow("NODE_ENV"),
          isGlobal: true,
          level: config.getOrThrow("LOG_LEVEL"),
          service: config.getOrThrow("SERVICE_NAME"),
        };
      },
    }),
    ResponseModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      connectionNames: ["default"],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService) => {
        const config = configService as ConfigService<AppConfig>;

        return {
          connections: [
            {
              name: "default",
              url: config.getOrThrow("REDIS_URL"),
            },
          ],
          isGlobal: true,
          lock: {
            connectionName: "default",
            defaultTtl: 10_000,
            keyPrefix: "example:scheduler:",
            retryAttempts: 0,
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    SchedulerModule.forRoot({
      driver: "redis",
      isGlobal: true,
      logging: "verbose",
      lock: {
        keyPrefix: "example:scheduler:",
        ttl: 10_000,
      },
    }),
  ],
  controllers: [
    ConfigController,
    HealthController,
    LoggerController,
    ResponseController,
    SchedulerController,
  ],
  providers: [LoggerDemoService, RedisStartupProbe, SchedulerDemoService],
})
export class AppModule {}
