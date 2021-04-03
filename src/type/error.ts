import { NextApiRequest } from "next";
import { ZodError, ZodTypeAny, z, ZodObject } from "zod";

type Location = "query" | "headers" | "body";
type ApiErrorResponse = {
  code: number;
  name: string;
  msg: string;
  requestId: string;
  [k: string]: any;
};

export abstract class ApiError extends Error {
  abstract json(): ApiErrorResponse;

  constructor(readonly requestId: string, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiParseError extends ApiError {
  name = "ApiParseError";

  constructor(
    readonly zodError: ZodError,
    readonly code: number,
    readonly loc: Location,
    requestId: string,
    message: string
  ) {
    super(requestId, message);
    this.name = "ApiParseError";
  }

  json(): ApiErrorResponse {
    return {
      code: this.code,
      name: this.name,
      msg: this.message,
      requestId: this.requestId,
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
      400,
      "query",
      requestId,
      "failed to parse request query parameters"
    );
  }
}

export class ApiParseHeadersError extends ApiParseError {
  name = "ApiParseHeadersError";

  constructor(zodError: ZodError, requestId: string) {
    super(
      zodError,
      400,
      "headers",
      requestId,
      "failed to parse request headers"
    );
  }
}

export class ApiParseBodyError extends ApiParseError {
  name = "ApiParseBodyError";

  constructor(zodError: ZodError, requestId: string) {
    super(zodError, 400, "body", requestId, "failed to parse request body");
  }
}

type ZodParsed<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ZodError<T>;
    };

export function checkParsed<T>(
  parsed: ZodParsed<T>,
  loc: Location,
  requestId: string
): T {
  if (!parsed.success) {
    switch (loc) {
      case "query":
        throw new ApiParseQueryError(parsed.error, requestId);
      case "headers":
        throw new ApiParseHeadersError(parsed.error, requestId);
      case "body":
        throw new ApiParseBodyError(parsed.error, requestId);

      default:
        throw new Error("unreachable");
    }
  }

  return parsed.data;
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
