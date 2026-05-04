import { BadRequestException, Controller, Get } from "@nestjs/common";
import { ResponseBuilder } from "@raytonx/nest-response";

interface ResponseDemoPayload {
  generatedAt: string;
  items: string[];
  module: string;
}

@Controller("response")
export class ResponseController {
  @Get("success")
  getSuccess(): ResponseDemoPayload {
    return {
      generatedAt: new Date().toISOString(),
      items: ["transform-interceptor", "exception-filter", "response-builder"],
      module: "@raytonx/nest-response",
    };
  }

  @Get("manual")
  getManual() {
    return ResponseBuilder.success(
      {
        mode: "manual",
        module: "@raytonx/nest-response",
      },
      {
        code: "RESPONSE_DEMO_OK",
        message: "response demo envelope built manually",
      },
    );
  }

  @Get("error")
  getError(): never {
    throw new BadRequestException("Response demo invalid request");
  }
}
