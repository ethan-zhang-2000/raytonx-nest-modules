import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Optional,
} from "@nestjs/common";
import { type HttpAdapterHost } from "@nestjs/core";

import { ResponseBuilder } from "./response.builder";
import { DEFAULT_ERROR_MESSAGE, RESPONSE_MODULE_OPTIONS } from "./response.constants";
import type { ResponseModuleOptions } from "./response.interfaces";

interface HttpResponseLike {
  end?(body?: string): unknown;
  json?(body: unknown): unknown;
  send?(body: unknown): unknown;
  status?(statusCode: number): HttpResponseLike;
  statusCode?: number;
}

@Catch()
@Injectable()
export class ResponseExceptionFilter implements ExceptionFilter {
  constructor(
    @Optional()
    @Inject(RESPONSE_MODULE_OPTIONS)
    private readonly options: ResponseModuleOptions = {},
    @Optional()
    private readonly httpAdapterHost?: HttpAdapterHost,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== "http") {
      return;
    }

    const status = this.getStatus(exception);
    const message = this.getMessage(exception);
    const response = host.switchToHttp().getResponse<HttpResponseLike>();
    const body = ResponseBuilder.error({
      code: this.options.errorCode ?? ResponseBuilder.httpStatusToCode(status),
      message: this.options.errorMessage ?? message ?? DEFAULT_ERROR_MESSAGE,
    });

    this.reply(response, body, status);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): string | undefined {
    if (!(exception instanceof HttpException)) {
      return undefined;
    }

    const response = exception.getResponse();
    const message = this.getResponseMessage(response);

    if (message !== undefined) {
      return message;
    }

    if (exception.message.trim() !== "") {
      return exception.message;
    }

    return undefined;
  }

  private getResponseMessage(response: string | object): string | undefined {
    if (typeof response === "string") {
      return response;
    }

    const message = (response as Record<string, unknown>).message;

    if (Array.isArray(message)) {
      return message.map(String).join(", ");
    }

    if (typeof message === "string" && message.trim() !== "") {
      return message;
    }

    return undefined;
  }

  private reply(response: HttpResponseLike, body: unknown, status: number): void {
    const httpAdapter = this.httpAdapterHost?.httpAdapter;

    if (httpAdapter !== undefined) {
      httpAdapter.reply(response, body, status);
      return;
    }

    const statusResponse = response.status?.(status) ?? response;

    if (typeof statusResponse.json === "function") {
      statusResponse.json(body);
      return;
    }

    if (typeof statusResponse.send === "function") {
      statusResponse.send(body);
      return;
    }

    response.statusCode = status;
    response.end?.(JSON.stringify(body));
  }
}
