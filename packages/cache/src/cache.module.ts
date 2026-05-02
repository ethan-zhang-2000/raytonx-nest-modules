import {
  CacheModule as NestCacheModule,
  type CacheModuleAsyncOptions as NestCacheModuleAsyncOptions,
} from "@nestjs/cache-manager";
import { type DynamicModule, Module, type Provider } from "@nestjs/common";
import type { ModuleOptionsFactory } from "@raytonx/core";

import { CACHE_MODULE_OPTIONS } from "./cache.constants";
import type { CacheModuleAsyncOptions, CacheModuleOptions } from "./cache.interfaces";
import { CacheService } from "./cache.service";
import { createNestCacheOptions } from "./cache.utils";

@Module({})
export class CacheModule {
  static forRoot(options: CacheModuleOptions = {}): DynamicModule {
    const nestCacheOptions = createNestCacheOptions(options);
    const dynamicModule: DynamicModule = {
      module: CacheModule,
      imports: [NestCacheModule.register(nestCacheOptions)],
      providers: [
        {
          provide: CACHE_MODULE_OPTIONS,
          useValue: options,
        },
        CacheService,
      ],
      exports: [CacheService, NestCacheModule],
    };
    const isGlobal = options.isGlobal ?? options.global;

    if (isGlobal !== undefined) {
      dynamicModule.global = isGlobal;
    }

    return dynamicModule;
  }

  static forRootAsync(options: CacheModuleAsyncOptions): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: CacheModule,
      imports: [NestCacheModule.registerAsync(this.createNestAsyncOptions(options))],
      providers: [
        ...this.createAsyncProviders(options),
        this.createAsyncOptionsProvider(options),
        CacheService,
      ],
      exports: [CacheService, NestCacheModule],
    };
    const isGlobal = options.isGlobal ?? options.global;

    if (isGlobal !== undefined) {
      dynamicModule.global = isGlobal;
    }

    if (options.imports !== undefined) {
      dynamicModule.imports = [...options.imports, ...dynamicModule.imports!];
    }

    return dynamicModule;
  }

  private static createNestAsyncOptions(
    options: CacheModuleAsyncOptions,
  ): NestCacheModuleAsyncOptions {
    const baseOptions: Pick<NestCacheModuleAsyncOptions, "imports" | "isGlobal"> = {};
    const isGlobal = options.isGlobal ?? options.global;

    if (options.imports !== undefined) {
      baseOptions.imports = options.imports;
    }

    if (isGlobal !== undefined) {
      baseOptions.isGlobal = isGlobal;
    }

    if (options.useFactory) {
      return {
        ...baseOptions,
        inject: options.inject ?? [],
        useFactory: async (...args: unknown[]) =>
          createNestCacheOptions(await options.useFactory!(...args)),
      };
    }

    const optionsFactory = options.useExisting ?? options.useClass;

    if (!optionsFactory) {
      throw new Error("CacheModule.forRootAsync requires useFactory, useClass, or useExisting.");
    }

    const nestAsyncOptions: NestCacheModuleAsyncOptions = {
      ...baseOptions,
      inject: [optionsFactory],
      useFactory: async (factory: ModuleOptionsFactory<CacheModuleOptions>) =>
        createNestCacheOptions(await factory.createModuleOptions()),
    };

    if (options.useClass) {
      nestAsyncOptions.extraProviders = [
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }

    return nestAsyncOptions;
  }

  private static createAsyncProviders(options: CacheModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: CacheModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: CACHE_MODULE_OPTIONS,
        useFactory: async (...args: unknown[]) => options.useFactory!(...args),
        inject: options.inject ?? [],
      };
    }

    const optionsFactory = options.useExisting ?? options.useClass;

    if (!optionsFactory) {
      throw new Error("CacheModule.forRootAsync requires useFactory, useClass, or useExisting.");
    }

    return {
      provide: CACHE_MODULE_OPTIONS,
      useFactory: async (factory: ModuleOptionsFactory<CacheModuleOptions>) =>
        factory.createModuleOptions(),
      inject: [optionsFactory],
    };
  }
}
