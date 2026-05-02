import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { describe, expect, it } from "vitest";

import { ResponseExceptionFilter } from "./response-exception.filter";
import { RESPONSE_MODULE_OPTIONS } from "./response.constants";
import { ResponseModule } from "./response.module";
import { TransformInterceptor } from "./transform.interceptor";

describe("ResponseModule", () => {
  it("maps isGlobal to the Nest dynamic module global option", () => {
    const dynamicModule = ResponseModule.forRoot({
      isGlobal: true,
    });

    expect(dynamicModule.global).toBe(true);
  });

  it("provides module options and registers the transform interceptor globally", () => {
    const dynamicModule = ResponseModule.forRoot({
      successCode: "SUCCESS",
      successMessage: "ok",
    });

    expect(dynamicModule.providers).toContainEqual({
      provide: RESPONSE_MODULE_OPTIONS,
      useValue: {
        successCode: "SUCCESS",
        successMessage: "ok",
      },
    });
    expect(dynamicModule.providers).toContainEqual({
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    });
    expect(dynamicModule.providers).toContainEqual({
      provide: APP_FILTER,
      useClass: ResponseExceptionFilter,
    });
  });
});
