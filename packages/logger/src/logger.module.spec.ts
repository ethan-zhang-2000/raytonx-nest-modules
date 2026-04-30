import { describe, expect, it, vi } from "vitest";

(
  vi.mock as unknown as (
    path: string,
    factory: () => unknown,
    options: {
      virtual: boolean;
    },
  ) => void
)(
  "@nestjs/common",
  () => ({
    Inject: () => () => undefined,
    Injectable: () => () => undefined,
    Logger: class LoggerMock {
      debug(): void {}
      error(): void {}
      log(): void {}
      verbose(): void {}
      warn(): void {}
    },
    Module: () => () => undefined,
    Optional: () => () => undefined,
  }),
  {
    virtual: true,
  },
);

(
  vi.mock as unknown as (
    path: string,
    factory: () => unknown,
    options: {
      virtual: boolean;
    },
  ) => void
)(
  "@raytonx/core",
  () => ({
    createInjectionToken: (packageName: string, tokenName: string) => `${packageName}:${tokenName}`,
  }),
  {
    virtual: true,
  },
);

(
  vi.mock as unknown as (
    path: string,
    factory: () => unknown,
    options: {
      virtual: boolean;
    },
  ) => void
)(
  "nestjs-pino",
  () => ({
    Logger: class PinoLoggerMock {},
    LoggerModule: {
      forRoot: (options: unknown) => ({
        module: "PinoLoggerModule",
        options,
      }),
      forRootAsync: (options: unknown) => ({
        module: "PinoLoggerModule",
        options,
      }),
    },
  }),
  {
    virtual: true,
  },
);

const { LOGGER_MODULE_OPTIONS } = await import("./logger.constants");
const { LoggerModule } = await import("./logger.module");

describe("LoggerModule", () => {
  it("maps isGlobal to the Nest dynamic module global option", () => {
    const dynamicModule = LoggerModule.forRoot({
      isGlobal: true,
    });

    expect(dynamicModule.global).toBe(true);
  });

  it("provides normalized logger module options", () => {
    const dynamicModule = LoggerModule.forRoot({
      env: "test",
      service: "orders",
    });

    expect(dynamicModule.providers).toContainEqual({
      provide: LOGGER_MODULE_OPTIONS,
      useValue: expect.objectContaining({
        env: "test",
        level: "info",
        service: "orders",
      }),
    });
  });

  it("creates an async options provider for useFactory", async () => {
    const dynamicModule = LoggerModule.forRootAsync({
      useFactory: async () => ({
        service: "async-service",
      }),
    });
    const asyncProvider = dynamicModule.providers?.find(
      (provider: unknown) =>
        typeof provider === "object" &&
        provider !== null &&
        "provide" in provider &&
        provider.provide === LOGGER_MODULE_OPTIONS,
    ) as {
      useFactory: () => Promise<unknown>;
    };
    const options = await asyncProvider.useFactory();

    expect(options).toEqual(
      expect.objectContaining({
        service: "async-service",
      }),
    );
  });
});
