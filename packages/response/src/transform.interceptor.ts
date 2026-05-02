import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
  Optional,
} from "@nestjs/common";
import { type Observable, map } from "rxjs";

import { ResponseBuilder } from "./response.builder";
import { RESPONSE_MODULE_OPTIONS } from "./response.constants";
import type { ResponseBuilderOptions, ResponseModuleOptions } from "./response.interfaces";

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(
    @Optional()
    @Inject(RESPONSE_MODULE_OPTIONS)
    private readonly options: ResponseModuleOptions = {},
  ) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (!this.options.wrapExistingEnvelope && ResponseBuilder.isEnvelope(data)) {
          return data;
        }

        return ResponseBuilder.success(data ?? null, {
          ...this.createSuccessOptions(),
        });
      }),
    );
  }

  private createSuccessOptions(): ResponseBuilderOptions {
    const options: ResponseBuilderOptions = {};

    if (this.options.successCode !== undefined) {
      options.code = this.options.successCode;
    }

    if (this.options.successMessage !== undefined) {
      options.message = this.options.successMessage;
    }

    return options;
  }
}
