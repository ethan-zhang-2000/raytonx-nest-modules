import { describe, expect, it } from "vitest";

import { ResponseBuilder } from "./response.builder";

describe("ResponseBuilder", () => {
  it("creates a success response with default code and message", () => {
    expect(ResponseBuilder.success({ id: 1 })).toEqual({
      success: true,
      code: "OK",
      message: "success",
      data: {
        id: 1,
      },
    });
  });

  it("creates a success response with custom code and message", () => {
    expect(
      ResponseBuilder.success("created", {
        code: "CREATED",
        message: "created",
      }),
    ).toEqual({
      success: true,
      code: "CREATED",
      message: "created",
      data: "created",
    });
  });

  it("creates an error response with default code and message", () => {
    expect(ResponseBuilder.error()).toEqual({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      data: null,
    });
  });

  it("creates an error response with custom code and message", () => {
    expect(
      ResponseBuilder.error({
        code: "BAD_REQUEST",
        message: "Invalid request",
      }),
    ).toEqual({
      success: false,
      code: "BAD_REQUEST",
      message: "Invalid request",
      data: null,
    });
  });

  it("detects a response envelope", () => {
    expect(ResponseBuilder.isEnvelope(ResponseBuilder.success(null))).toBe(true);
  });

  it("does not treat a plain object as a response envelope", () => {
    expect(
      ResponseBuilder.isEnvelope({
        id: 1,
      }),
    ).toBe(false);
  });

  it("maps an HTTP status to a standard code", () => {
    expect(ResponseBuilder.httpStatusToCode(400)).toBe("BAD_REQUEST");
  });

  it("falls back for an unknown HTTP status", () => {
    expect(ResponseBuilder.httpStatusToCode(599)).toBe("UNKNOWN_ERROR");
  });
});
