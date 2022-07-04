import { ZodError } from "zod";
import { CustomError } from "./common";

type ApiErrorResponse = {
  code: number;
  name: string;
  msg: string;
  requestId: string;
  [k: string]: unknown;
};

export abstract class ApiError extends CustomError {
  constructor(readonly code: number, readonly requestId: string, message: string) {
    super(message);
    this.name = "ApiError";
  }

  json(): ApiErrorResponse {
    return {
      code: this.code,
      name: this.name,
      msg: this.message,
      requestId: this.requestId,
    };
  }
}

export class ApiNotFoundError extends ApiError {
  constructor(requestId: string, message?: string) {
    super(404, requestId, message ?? "Not Found");
    this.name = "ApiNotFoundError";
  }
}

export class ApiInternalServerError extends ApiError {
  constructor(requestId: string, message?: string) {
    super(500, requestId, message ?? "Internal Server Error");
    this.name = "ApiInternalServerError";
  }
}

// ==============
// 400 ParseError
// ==============

type Location = "query" | "headers" | "body";

export class ApiParseError extends ApiError {
  name = "ApiParseError";

  constructor(
    readonly zodError: ZodError,
    readonly loc: Location,
    requestId: string,
    message?: string
  ) {
    super(400, requestId, message ?? "Bad Request");
    this.name = "ApiParseError";
  }

  json(): ApiErrorResponse {
    return {
      ...super.json(),
      loc: this.loc,
      issues: this.zodError.issues,
    };
  }
}

export class ApiParseQueryError extends ApiParseError {
  name = "ApiParseQueryError";

  constructor(zodError: ZodError, requestId: string) {
    super(zodError, "query", requestId, "failed to parse request query parameters");
  }
}

export class ApiParseHeadersError extends ApiParseError {
  name = "ApiParseHeadersError";

  constructor(zodError: ZodError, requestId: string) {
    super(zodError, "headers", requestId, "failed to parse request headers");
  }
}

export class ApiParseBodyError extends ApiParseError {
  name = "ApiParseBodyError";

  constructor(zodError: ZodError, requestId: string) {
    super(zodError, "body", requestId, "failed to parse request body");
  }
}
