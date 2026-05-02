# @raytonx/nest-response

NestJS 应用的统一响应结构工具包。

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

## 工具方法

- `ResponseBuilder.isEnvelope(value)`：判断值是否已经是统一响应结构。
- `ResponseBuilder.httpStatusToCode(status)`：将 HTTP 状态码转换为状态文本，例如 `400` 转为 `BAD_REQUEST`。

## 导出内容

- `ResponseBuilder`
- `ResponseEnvelope<T>`
- `ResponseErrorEnvelope`
- `ResponseBuilderOptions`

## 后续版本

`TransformInterceptor`、`ExceptionFilter` 与 `ResponseModule` 会在后续版本加入。当前版本只提供纯工具能力，不会自动修改 NestJS 控制器返回值或异常响应。
