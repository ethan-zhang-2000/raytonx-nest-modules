import { Module } from "@nestjs/common";
import { ConfigModule } from "@raytonx/config";

import { ConfigController } from "./config.controller";
import { type AppConfig, appConfigSchema } from "./config.schema";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot<AppConfig>({
      envFilePath: "auto",
      isGlobal: true,
      schema: appConfigSchema,
    }),
  ],
  controllers: [ConfigController, HealthController],
})
export class AppModule {}
