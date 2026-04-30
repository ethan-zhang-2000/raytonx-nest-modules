/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "@nestjs/common" {
  export type Type<T = unknown> = new (...args: any[]) => T;
  export type InjectionToken = string | symbol | Type<unknown>;

  export interface DynamicModule {
    exports?: unknown[];
    global?: boolean;
    imports?: Array<Type<unknown> | DynamicModule>;
    module: Type<unknown> | unknown;
    providers?: Provider[];
  }

  export interface ClassProvider<T = unknown> {
    provide: InjectionToken;
    useClass: Type<T>;
  }

  export interface FactoryProvider<T = unknown> {
    inject?: InjectionToken[];
    provide: InjectionToken;
    useFactory: (...args: any[]) => T | Promise<T>;
  }

  export interface ValueProvider<T = unknown> {
    provide: InjectionToken;
    useValue: T;
  }

  export interface ExistingProvider {
    provide: InjectionToken;
    useExisting: InjectionToken;
  }

  export type Provider<T = unknown> =
    | Type<T>
    | ClassProvider<T>
    | ExistingProvider
    | FactoryProvider<T>
    | ValueProvider<T>;

  export interface LoggerService {
    debug?(message: any, ...optionalParams: any[]): any;
    error(message: any, ...optionalParams: any[]): any;
    fatal?(message: any, ...optionalParams: any[]): any;
    log(message: any, ...optionalParams: any[]): any;
    verbose?(message: any, ...optionalParams: any[]): any;
    warn(message: any, ...optionalParams: any[]): any;
  }

  export class Logger implements LoggerService {
    constructor(context?: string);
    debug(message: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
    fatal(message: any, ...optionalParams: any[]): void;
    log(message: any, ...optionalParams: any[]): void;
    verbose(message: any, ...optionalParams: any[]): void;
    warn(message: any, ...optionalParams: any[]): void;
  }

  export function Inject(token?: InjectionToken): ParameterDecorator & PropertyDecorator;
  export function Injectable(): ClassDecorator;
  export function Module(metadata?: {
    exports?: unknown[];
    imports?: Array<Type<unknown> | DynamicModule>;
    providers?: Provider[];
  }): ClassDecorator;
  export function Optional(): ParameterDecorator & PropertyDecorator;
}
