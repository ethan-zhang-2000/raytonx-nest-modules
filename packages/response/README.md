# @raytonx/nest-response

NestJS 应用的统一响应结构模块与工具包。

English version: [README.en.md](README.en.md)

## 安装

```bash
pnpm add @raytonx/nest-response
```

```bash
npm i @raytonx/nest-response
```

```bash
yarn add @raytonx/nest-response
```

## 快速开始

全局注册响应转换拦截器与异常过滤器：

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

Controller 返回值会被包装为统一结构：

```ts
{
  id: 1,
  name: "RaytonX"
}
```

返回：

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

抛出的 Nest HTTP 异常也会被包装为统一错误结构：

```ts
throw new BadRequestException("Invalid request");
```

返回：

```json
{
  "success": false,
  "code": "BAD_REQUEST",
  "message": "Invalid request",
  "data": null
}
```

也可以直接使用 `ResponseBuilder`：

```ts
import { ResponseBuilder } from "@raytonx/nest-response";

const response = ResponseBuilder.success({
  id: 1,
  name: "RaytonX",
});
```

返回：

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

## 模块注册

```ts
ResponseModule.forRoot({
  isGlobal: true,
  successCode: "OK",
  successMessage: "success",
  errorCode: "INTERNAL_SERVER_ERROR",
  errorMessage: "Internal server error",
});
```

配置项：

- `isGlobal` / `global`：映射到 Nest 动态模块的 `global` 配置。
- `successCode`：成功响应默认 `code`，默认值为 `OK`。
- `successMessage`：成功响应默认 `message`，默认值为 `success`。
- `errorCode`：错误响应默认 `code`，默认按 HTTP 状态码转换，例如 `400` 转为 `BAD_REQUEST`。
- `errorMessage`：错误响应默认 `message`。未配置时，HTTP 异常优先使用 Nest 异常响应中的 `message`，未知异常使用 `Internal server error`。
- `wrapExistingEnvelope`：是否继续包装已经是统一结构的返回值，默认 `false`。

## 成功响应

```ts
ResponseBuilder.success(data);

ResponseBuilder.success(data, {
  code: "CREATED",
  message: "created",
});
```

默认成功结构：

```ts
{
  success: true,
  code: "OK",
  message: "success",
  data
}
```

## 错误响应

```ts
ResponseBuilder.error();

ResponseBuilder.error({
  code: "BAD_REQUEST",
  message: "Invalid request",
});
```

默认错误结构：

```ts
{
  success: false,
  code: "INTERNAL_SERVER_ERROR",
  message: "Internal server error",
  data: null
}
```

`ResponseExceptionFilter` 会自动处理 HTTP 异常与未知异常：

- HTTP 异常使用异常状态码，例如 `BadRequestException` 返回 `400`。
- 默认 `code` 由 HTTP 状态码转换得到，例如 `400` 转为 `BAD_REQUEST`。
- 默认 `message` 优先读取 Nest 异常响应体中的 `message`；数组消息会合并为字符串。
- 未知异常返回 `500`，并使用默认错误文案，避免暴露内部错误信息。

## 工具方法

- `ResponseBuilder.isEnvelope(value)`：判断值是否已经是统一响应结构。
- `ResponseBuilder.httpStatusToCode(status)`：将 HTTP 状态码转换为状态文本，例如 `400` 转为 `BAD_REQUEST`。

## 导出内容

- `ResponseModule`
- `TransformInterceptor`
- `ResponseExceptionFilter`
- `ResponseBuilder`
- `ResponseEnvelope<T>`
- `ResponseErrorEnvelope`
- `ResponseBuilderOptions`
- `ResponseModuleOptions`
