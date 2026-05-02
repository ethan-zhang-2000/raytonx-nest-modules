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

Register the response transform interceptor globally:

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
});
```

Options:

- `isGlobal` / `global` - maps to the Nest dynamic module `global` option.
- `successCode` - default success response `code`, defaults to `OK`.
- `successMessage` - default success response `message`, defaults to `success`.
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

## Helpers

- `ResponseBuilder.isEnvelope(value)` - checks whether a value already uses the standard response envelope.
- `ResponseBuilder.httpStatusToCode(status)` - converts an HTTP status code to a status text, for example `400` to `BAD_REQUEST`.

## Exports

- `ResponseModule`
- `TransformInterceptor`
- `ResponseBuilder`
- `ResponseEnvelope<T>`
- `ResponseErrorEnvelope`
- `ResponseBuilderOptions`
- `ResponseModuleOptions`

## Future Versions

`ExceptionFilter` will be added in a later version. This version only standardizes success responses and does not automatically change NestJS exception responses.
