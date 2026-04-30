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
      forRoot: () => ({}),
      forRootAsync: () => ({}),
    },
  }),
  {
    virtual: true,
  },
);

const { Log } = await import("./logger.decorators");
const { LoggerService } = await import("./logger.service");
const { normalizeLoggerModuleOptions } = await import("./logger.utils");

describe("@Log", () => {
  it("logs successful method calls with redacted args and result", () => {
    const info = vi.fn();

    new LoggerService(
      normalizeLoggerModuleOptions({
        service: "test-service",
      }),
      {
        log: info,
      } as never,
    );

    class TestService {
      @Log()
      create(_input: { mobile: string }): { idCard: string } {
        return {
          idCard: "11010119900307123X",
        };
      }
    }

    const result = new TestService().create({
      mobile: "13812345678",
    });

    expect(result).toEqual({
      idCard: "11010119900307123X",
    });
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        args: [
          {
            mobile: "[Redacted]",
          },
        ],
        event: "method_succeeded",
        result: {
          idCard: "[Redacted]",
        },
        service: "test-service",
        status: "success",
      }),
      "TestService.create",
    );
  });

  it("logs failed method calls and rethrows the original error", () => {
    const error = vi.fn();

    new LoggerService(normalizeLoggerModuleOptions(), {
      error,
    } as never);

    class TestService {
      @Log()
      fail(): void {
        throw new TypeError("boom 13987654321");
      }
    }

    expect(() => new TestService().fail()).toThrow(TypeError);
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({
        errorMessage: "boom 139[Redacted]4321",
        errorName: "TypeError",
        event: "method_failed",
        status: "failed",
      }),
      "TestService.fail",
    );
  });
});
