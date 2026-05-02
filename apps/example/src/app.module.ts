import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@raytonx/config";
import { LoggerModule } from "@raytonx/nest-logger";

import { ConfigController } from "./config.controller";
import { type AppConfig, appConfigSchema } from "./config.schema";
import { HealthController } from "./health.controller";
import { LoggerDemoService } from "./logger-demo.service";
import { LoggerController } from "./logger.controller";

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
  ],
  controllers: [ConfigController, HealthController, LoggerController],
  providers: [LoggerDemoService],
})
export class AppModule {}
