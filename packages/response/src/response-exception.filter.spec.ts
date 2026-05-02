import { type ArgumentsHost, BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { ResponseExceptionFilter } from "./response-exception.filter";

describe("ResponseExceptionFilter", () => {
  it("wraps an HTTP exception in an error envelope", () => {
    const { host, json, status } = createHttpHost();
    const filter = new ResponseExceptionFilter();

    filter.catch(new BadRequestException("Invalid request"), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      code: "BAD_REQUEST",
      message: "Invalid request",
      data: null,
    });
  });

  it("joins array messages from an HTTP exception response", () => {
    const { host, json } = createHttpHost();
    const filter = new ResponseExceptionFilter();

    filter.catch(
      new BadRequestException({
        message: ["name is required", "email is invalid"],
      }),
      host,
    );

    expect(json).toHaveBeenCalledWith({
      success: false,
      code: "BAD_REQUEST",
      message: "name is required, email is invalid",
      data: null,
    });
  });

  it("hides unknown error messages", () => {
    const { host, json, status } = createHttpHost();
    const filter = new ResponseExceptionFilter();

    filter.catch(new Error("database password leaked"), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      data: null,
    });
  });

  it("uses configured error code and message", () => {
    const { host, json } = createHttpHost();
    const filter = new ResponseExceptionFilter({
      errorCode: "REQUEST_INVALID",
      errorMessage: "Request invalid",
    });

    filter.catch(new BadRequestException("Invalid request"), host);

    expect(json).toHaveBeenCalledWith({
      success: false,
      code: "REQUEST_INVALID",
      message: "Request invalid",
      data: null,
    });
  });

  it("does not write a response for non-HTTP contexts", () => {
    const { host, json, status } = createHttpHost("rpc");
    const filter = new ResponseExceptionFilter();

    filter.catch(new BadRequestException("Invalid request"), host);

    expect(status).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });
});

function createHttpHost(type = "http"): {
  host: ArgumentsHost;
  json: ReturnType<typeof vi.fn>;
  status: ReturnType<typeof vi.fn>;
} {
  const json = vi.fn();
  const status = vi.fn();
  status.mockReturnValue({
    json,
  });

  return {
    host: {
      getType: () => type,
      switchToHttp: () => ({
        getResponse: () => ({
          status,
        }),
      }),
    } as ArgumentsHost,
    json,
    status,
  };
}
