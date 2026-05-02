# @raytonx/nest-response

Response envelope module and helpers for NestJS applications.

Chinese version: [README.md](README.md)

## Installation

```bash
pnpm add @raytonx/nest-response
```

```bash
npm i @raytonx/nest-response
```

```bash
yarn add @raytonx/nest-response
```

## Quick Start

Register the response transform interceptor and exception filter globally:

```ts
import { Module } from "@nestjs/common";
import { ResponseModule } from "@raytonx/nest-response";

@Module({
  imports: [
    ResponseModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

Controller return values are wrapped in the standard envelope:

```ts
{
  id: 1,
  name: "RaytonX"
}
```

Returns:

```json
{
  "success": true,
  "code": "OK",
  "message": "success",
  "data": {
    "id": 1,
    "name": "RaytonX"
  }
}
```

Thrown Nest HTTP exceptions are also wrapped in the standard error envelope:

```ts
throw new BadRequestException("Invalid request");
```

Returns:

```json
{
  "success": false,
  "code": "BAD_REQUEST",
  "message": "Invalid request",
  "data": null
}
```

You can also use `ResponseBuilder` directly:

```ts
import { ResponseBuilder } from "@raytonx/nest-response";

const response = ResponseBuilder.success({
  id: 1,
  name: "RaytonX",
});
```

Returns:

```json
{
  "success": true,
  "code": "OK",
  "message": "success",
  "data": {
    "id": 1,
    "name": "RaytonX"
  }
}
```

## Module Registration

```ts
ResponseModule.forRoot({
  isGlobal: true,
  successCode: "OK",
  successMessage: "success",
  errorCode: "INTERNAL_SERVER_ERROR",
  errorMessage: "Internal server error",
});
```

Options:

- `isGlobal` / `global` - maps to the Nest dynamic module `global` option.
- `successCode` - default success response `code`, defaults to `OK`.
- `successMessage` - default success response `message`, defaults to `success`.
- `errorCode` - default error response `code`, defaults to the HTTP status text, for example `400` to `BAD_REQUEST`.
- `errorMessage` - default error response `message`. When omitted, HTTP exceptions prefer the Nest exception response `message`, and unknown exceptions use `Internal server error`.
- `wrapExistingEnvelope` - whether to wrap return values that already use the standard envelope, defaults to `false`.

## Success Responses

```ts
ResponseBuilder.success(data);

ResponseBuilder.success(data, {
  code: "CREATED",
  message: "created",
});
```

Default success envelope:

```ts
{
  success: true,
  code: "OK",
  message: "success",
  data
}
```

## Error Responses

```ts
ResponseBuilder.error();

ResponseBuilder.error({
  code: "BAD_REQUEST",
  message: "Invalid request",
});
```

Default error envelope:

```ts
{
  success: false,
  code: "INTERNAL_SERVER_ERROR",
  message: "Internal server error",
  data: null
}
```

`ResponseExceptionFilter` automatically handles HTTP exceptions and unknown exceptions:

- HTTP exceptions use their exception status, for example `BadRequestException` returns `400`.
- The default `code` is converted from the HTTP status, for example `400` to `BAD_REQUEST`.
- The default `message` prefers the Nest exception response `message`; array messages are joined into a string.
- Unknown exceptions return `500` and use the default error message to avoid exposing internal error details.

## Helpers

- `ResponseBuilder.isEnvelope(value)` - checks whether a value already uses the standard response envelope.
- `ResponseBuilder.httpStatusToCode(status)` - converts an HTTP status code to a status text, for example `400` to `BAD_REQUEST`.

## Exports

- `ResponseModule`
- `TransformInterceptor`
- `ResponseExceptionFilter`
- `ResponseBuilder`
- `ResponseEnvelope<T>`
- `ResponseErrorEnvelope`
- `ResponseBuilderOptions`
- `ResponseModuleOptions`
