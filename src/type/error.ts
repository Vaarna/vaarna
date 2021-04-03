import { NextApiRequest } from "next";
import { ZodError, z } from "zod";

type Location = "query" | "headers" | "body";
type ApiErrorResponse = {
  code: number;
  name: string;
  msg: string;
  requestId: string;
  [k: string]: any;
};

export abstract class ApiError extends Error {
  constructor(
    readonly code: number,
    readonly requestId: string,
    message: string
  ) {
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
  constructor(requestId: string, message: string) {
    super(404, requestId, message);
  }
}

export class ApiParseError extends ApiError {
  name = "ApiParseError";

  constructor(
    readonly zodError: ZodError,
    readonly loc: Location,
    requestId: string,
    message: string
  ) {
    super(400, requestId, message);
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
    super(
      zodError,
      "query",
      requestId,
      "failed to parse request query parameters"
    );
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

export const parseRequest = <
  Q,
  H,
  B,
  Parser extends Partial<{
    query: z.ZodType<Q>;
    headers: z.ZodType<H>;
    body: z.ZodType<B>;
  }>
>(
  parser: Parser
) => (
  req: NextApiRequest,
  requestId: string
): {
  [k in keyof Parser]: Parser[k] extends z.ZodType<
    infer Output,
    infer _Def,
    infer _Input
  >
    ? Output
    : never;
} => {
  const out: any = {};

  if (parser.query !== undefined) {
    const parsedQuery = parser.query.safeParse(req.query);
    if (!parsedQuery.success) {
      throw new ApiParseQueryError(parsedQuery.error, requestId);
    }
    out.query = parsedQuery.data;
  }

  if (parser.headers !== undefined) {
    const parsedHeaders = parser.headers.safeParse(req.headers);
    if (!parsedHeaders.success) {
      throw new ApiParseHeadersError(parsedHeaders.error, requestId);
    }
    out.headers = parsedHeaders.data;
  }

  if (parser.body !== undefined) {
    const parsedBody = parser.body.safeParse(req.body);
    if (!parsedBody.success) {
      throw new ApiParseHeadersError(parsedBody.error, requestId);
    }
    out.body = parsedBody.data;
  }

  return out;
};
