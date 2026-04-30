import { type DynamicModule, Module, type Provider } from "@nestjs/common";
import { LoggerModule as NestPinoLoggerModule } from "nestjs-pino";

import { LOGGER_MODULE_OPTIONS } from "./logger.constants";
import type { LoggerModuleAsyncOptions, LoggerModuleOptions } from "./logger.interfaces";
import { LoggerService } from "./logger.service";
import { createPinoHttpOptions, normalizeLoggerModuleOptions } from "./logger.utils";

@Module({})
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions = {}): DynamicModule {
    const normalizedOptions = normalizeLoggerModuleOptions(options);
    const dynamicModule: DynamicModule = {
      module: LoggerModule,
      imports: [
        NestPinoLoggerModule.forRoot({
          pinoHttp: createPinoHttpOptions(normalizedOptions),
        }),
      ],
      providers: [
        {
          provide: LOGGER_MODULE_OPTIONS,
          useValue: normalizedOptions,
        },
        LoggerService,
      ],
      exports: [LoggerService, LOGGER_MODULE_OPTIONS],
    };
    const isGlobal = normalizedOptions.isGlobal ?? normalizedOptions.global;

    if (isGlobal !== undefined) {
      dynamicModule.global = isGlobal;
    }

    return dynamicModule;
  }

  static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: LoggerModule,
      imports: [
        ...(options.imports ?? []),
        NestPinoLoggerModule.forRootAsync({
          imports: options.imports,
          inject: this.getAsyncInjectTokens(options),
          useFactory: async (...args: unknown[]) => ({
            pinoHttp: createPinoHttpOptions(
              normalizeLoggerModuleOptions(await this.resolveAsyncOptions(options, args)),
            ),
          }),
        }),
      ],
      providers: [
        this.createAsyncOptionsProvider(options),
        ...this.createAsyncProviders(options),
        LoggerService,
      ],
      exports: [LoggerService, LOGGER_MODULE_OPTIONS],
    };
    const isGlobal = options.isGlobal ?? options.global;

    if (isGlobal !== undefined) {
      dynamicModule.global = isGlobal;
    }

    return dynamicModule;
  }

  private static createAsyncProviders(options: LoggerModuleAsyncOptions): Provider[] {
    if (!options.useClass) {
      return [];
    }

    return [
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: LoggerModuleAsyncOptions): Provider {
    return {
      provide: LOGGER_MODULE_OPTIONS,
      inject: this.getAsyncInjectTokens(options),
      useFactory: async (...args: unknown[]) =>
        normalizeLoggerModuleOptions(await this.resolveAsyncOptions(options, args)),
    };
  }

  private static getAsyncInjectTokens(
    options: LoggerModuleAsyncOptions,
  ): NonNullable<LoggerModuleAsyncOptions["inject"]> {
    if (options.useFactory) {
      return options.inject ?? [];
    }

    const optionsFactory = options.useExisting ?? options.useClass;

    if (!optionsFactory) {
      throw new Error("LoggerModule.forRootAsync requires useFactory, useClass, or useExisting.");
    }

    return [optionsFactory];
  }

  private static async resolveAsyncOptions(
    options: LoggerModuleAsyncOptions,
    args: unknown[],
  ): Promise<LoggerModuleOptions> {
    if (options.useFactory) {
      return options.useFactory(...args);
    }

    const factory = args[0] as {
      createModuleOptions: () => LoggerModuleOptions | Promise<LoggerModuleOptions>;
    };

    return factory.createModuleOptions();
  }
}
