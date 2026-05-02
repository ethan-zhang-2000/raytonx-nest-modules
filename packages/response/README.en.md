# @raytonx/nest-response

Response envelope helpers for NestJS applications.

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

- `ResponseBuilder`
- `ResponseEnvelope<T>`
- `ResponseErrorEnvelope`
- `ResponseBuilderOptions`

## Future Versions

`TransformInterceptor`, `ExceptionFilter`, and `ResponseModule` will be added in later versions. This version only provides pure helper APIs and does not automatically change NestJS controller return values or exception responses.
