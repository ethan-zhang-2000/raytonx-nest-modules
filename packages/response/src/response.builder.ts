import { HttpStatus } from "@nestjs/common";

import {
  DEFAULT_ERROR_CODE,
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_SUCCESS_CODE,
  DEFAULT_SUCCESS_MESSAGE,
  UNKNOWN_ERROR_CODE,
} from "./response.constants";
import type {
  ResponseBuilderOptions,
  ResponseEnvelope,
  ResponseErrorEnvelope,
} from "./response.interfaces";

export class ResponseBuilder {
  static success<TData>(
    data: TData,
    options: ResponseBuilderOptions = {},
  ): ResponseEnvelope<TData> {
    return {
      success: true,
      code: options.code ?? DEFAULT_SUCCESS_CODE,
      message: options.message ?? DEFAULT_SUCCESS_MESSAGE,
      data,
    };
  }

  static error(options: ResponseBuilderOptions = {}): ResponseErrorEnvelope {
    return {
      success: false,
      code: options.code ?? DEFAULT_ERROR_CODE,
      message: options.message ?? DEFAULT_ERROR_MESSAGE,
      data: null,
    };
  }

  static isEnvelope(value: unknown): value is ResponseEnvelope | ResponseErrorEnvelope {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
      typeof candidate.success === "boolean" &&
      typeof candidate.code === "string" &&
      typeof candidate.message === "string" &&
      "data" in candidate
    );
  }

  static httpStatusToCode(status: number): string {
    return HttpStatus[status] ?? UNKNOWN_ERROR_CODE;
  }
}
