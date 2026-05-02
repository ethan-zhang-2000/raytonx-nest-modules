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

全局注册响应转换拦截器：

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
});
```

配置项：

- `isGlobal` / `global`：映射到 Nest 动态模块的 `global` 配置。
- `successCode`：成功响应默认 `code`，默认值为 `OK`。
- `successMessage`：成功响应默认 `message`，默认值为 `success`。
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

## 工具方法

- `ResponseBuilder.isEnvelope(value)`：判断值是否已经是统一响应结构。
- `ResponseBuilder.httpStatusToCode(status)`：将 HTTP 状态码转换为状态文本，例如 `400` 转为 `BAD_REQUEST`。

## 导出内容

- `ResponseModule`
- `TransformInterceptor`
- `ResponseBuilder`
- `ResponseEnvelope<T>`
- `ResponseErrorEnvelope`
- `ResponseBuilderOptions`
- `ResponseModuleOptions`

## 后续版本

`ExceptionFilter` 会在后续版本加入。当前版本只统一成功响应，不会自动修改 NestJS 异常响应。
