export interface ResponseEnvelope<TData = unknown> {
  success: true;
  code: string;
  message: string;
  data: TData;
}

export interface ResponseErrorEnvelope {
  success: false;
  code: string;
  message: string;
  data: null;
}

export interface ResponseBuilderOptions {
  code?: string;
  message?: string;
}

export interface ResponseModuleOptions {
  global?: boolean;
  isGlobal?: boolean;
  successCode?: string;
  successMessage?: string;
  wrapExistingEnvelope?: boolean;
}
