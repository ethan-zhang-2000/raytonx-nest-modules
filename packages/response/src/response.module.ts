import { type DynamicModule, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { RESPONSE_MODULE_OPTIONS } from "./response.constants";
import type { ResponseModuleOptions } from "./response.interfaces";
import { TransformInterceptor } from "./transform.interceptor";

@Module({})
export class ResponseModule {
  static forRoot(options: ResponseModuleOptions = {}): DynamicModule {
    const dynamicModule: DynamicModule = {
      module: ResponseModule,
      providers: [
        {
          provide: RESPONSE_MODULE_OPTIONS,
          useValue: options,
        },
        TransformInterceptor,
        {
          provide: APP_INTERCEPTOR,
          useClass: TransformInterceptor,
        },
      ],
      exports: [TransformInterceptor, RESPONSE_MODULE_OPTIONS],
    };
    const isGlobal = options.isGlobal ?? options.global;

    if (isGlobal !== undefined) {
      dynamicModule.global = isGlobal;
    }

    return dynamicModule;
  }
}
