import "reflect-metadata";

import type { LogOptions } from "./logger.interfaces";
import { LoggerService } from "./logger.service";

export function Log(options: LogOptions = {}): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
    const methodName = typeof propertyKey === "symbol" ? propertyKey.toString() : propertyKey;

    descriptor.value = function (this: object, ...args: unknown[]) {
      return LoggerService.runLoggedMethod({
        args,
        className: this.constructor?.name ?? target.constructor?.name ?? "AnonymousClass",
        instance: this,
        methodName,
        options,
        originalMethod,
      });
    };

    return descriptor;
  };
}
