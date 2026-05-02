import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { lastValueFrom, of } from "rxjs";
import { describe, expect, it } from "vitest";

import { ResponseBuilder } from "./response.builder";
import { TransformInterceptor } from "./transform.interceptor";

describe("TransformInterceptor", () => {
  const context = {} as ExecutionContext;

  it("wraps controller data in a success envelope", async () => {
    const interceptor = new TransformInterceptor();
    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of({ id: 1 }),
      } as CallHandler),
    );

    expect(result).toEqual({
      success: true,
      code: "OK",
      message: "success",
      data: {
        id: 1,
      },
    });
  });

  it("uses configured success code and message", async () => {
    const interceptor = new TransformInterceptor({
      successCode: "CREATED",
      successMessage: "created",
    });
    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of({ id: 1 }),
      } as CallHandler),
    );

    expect(result).toEqual({
      success: true,
      code: "CREATED",
      message: "created",
      data: {
        id: 1,
      },
    });
  });

  it("converts undefined controller data to null", async () => {
    const interceptor = new TransformInterceptor();
    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of(undefined),
      } as CallHandler),
    );

    expect(result).toEqual({
      success: true,
      code: "OK",
      message: "success",
      data: null,
    });
  });

  it("skips existing response envelopes by default", async () => {
    const envelope = ResponseBuilder.success({ id: 1 });
    const interceptor = new TransformInterceptor();
    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of(envelope),
      } as CallHandler),
    );

    expect(result).toBe(envelope);
  });

  it("wraps existing response envelopes when configured", async () => {
    const envelope = ResponseBuilder.success({ id: 1 });
    const interceptor = new TransformInterceptor({
      wrapExistingEnvelope: true,
    });
    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of(envelope),
      } as CallHandler),
    );

    expect(result).toEqual({
      success: true,
      code: "OK",
      message: "success",
      data: envelope,
    });
  });
});
