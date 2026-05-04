import { describe, expect, it, vi } from "vitest";

import {
  createPinoHttpOptions,
  normalizeLoggerModuleOptions,
  sanitizeLogValue,
} from "./logger.utils";

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

describe("logger utils", () => {
  it("normalizes module defaults", () => {
    const options = normalizeLoggerModuleOptions({
      generateId: () => "fixed-id",
      service: "billing-api",
    });

    expect(options).toEqual(
      expect.objectContaining({
        env: expect.any(String),
        level: "info",
        pretty: false,
        requestIdHeader: "x-request-id",
        service: "billing-api",
        traceIdHeader: "x-trace-id",
      }),
    );
  });

  it("enables pretty logging from LOG_PRETTY when the module option is not set", () => {
    vi.stubEnv("LOG_PRETTY", "true");

    const options = normalizeLoggerModuleOptions();

    expect(options.pretty).toBe(true);

    vi.unstubAllEnvs();
  });

  it("adds a pretty transport when pretty logging is enabled", () => {
    const options = normalizeLoggerModuleOptions({
      pretty: true,
    });
    const pinoHttp = createPinoHttpOptions(options);

    expect(pinoHttp.transport).toEqual({
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        singleLine: false,
        translateTime: "SYS:standard",
      },
    });
  });

  it("keeps a user-provided transport when pretty logging is enabled", () => {
    const options = normalizeLoggerModuleOptions({
      pretty: true,
      pinoHttp: {
        transport: {
          target: "custom-target",
        },
      },
    });
    const pinoHttp = createPinoHttpOptions(options);

    expect(pinoHttp.transport).toEqual({
      target: "custom-target",
    });
  });

  it("redacts sensitive fields and masks phone/id-card values", () => {
    const options = normalizeLoggerModuleOptions();
    const result = sanitizeLogValue(
      {
        idCard: "11010119900307123X",
        nested: {
          mobile: "13812345678",
        },
        profile: "phone=13987654321 id=440524188001010014",
      },
      options.redaction,
    );

    expect(result).toEqual({
      idCard: "[Redacted]",
      nested: {
        mobile: "[Redacted]",
      },
      profile: "phone=139[Redacted]4321 id=440524[Redacted]0014",
    });
  });

  it("adds request and trace ids to pino-http options", () => {
    const options = normalizeLoggerModuleOptions({
      generateId: () => "generated-id",
    });
    const pinoHttp = createPinoHttpOptions(options);
    const headers = new Map<string, string>();
    const req = {
      headers: {},
    };
    const res = {
      getHeader: (name: string) => headers.get(name),
      setHeader: (name: string, value: string) => headers.set(name, value),
    };

    type Req = typeof req;
    type Res = typeof res;

    const requestId = (pinoHttp.genReqId as (req: Req, res: Res) => string)(req, res);
    const props = (pinoHttp.customProps as (req: Req, res: Res) => Record<string, unknown>)(
      req,
      res,
    );

    expect(requestId).toBe("generated-id");
    expect(props).toEqual({
      requestId: "generated-id",
      traceId: "generated-id",
    });
    expect(headers.get("x-request-id")).toBe("generated-id");
    expect(headers.get("x-trace-id")).toBe("generated-id");
  });
});
