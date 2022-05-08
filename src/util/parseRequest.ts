import { z } from "zod";
import {
  ApiParseQueryError,
  ApiParseHeadersError,
  ApiParseBodyError,
  ApiError,
} from "type/error";
import { RequestWithLogger } from "./withDefaults";

export { ApiError };

export const parseQuery = <T>(req: RequestWithLogger, query: z.ZodType<T>): T => {
  const parsedQuery = query.safeParse(req.query);
  if (!parsedQuery.success) {
    throw new ApiParseQueryError(parsedQuery.error, req.requestId);
  }
  return parsedQuery.data;
};

export const parseHeaders = <T>(req: RequestWithLogger, headers: z.ZodType<T>): T => {
  const parsedHeaders = headers.safeParse(req.headers);
  if (!parsedHeaders.success) {
    throw new ApiParseHeadersError(parsedHeaders.error, req.requestId);
  }
  return parsedHeaders.data;
};

export const parseBody = <T>(req: RequestWithLogger, body: z.ZodType<T>): T => {
  const parsedBody = body.safeParse(req.body);
  if (!parsedBody.success) {
    throw new ApiParseBodyError(parsedBody.error, req.requestId);
  }
  return parsedBody.data;
};

export const parseRequest = <
  Query,
  Headers,
  Body,
  Parser extends Partial<{
    query: z.ZodType<Query>;
    headers: z.ZodType<Headers>;
    body: z.ZodType<Body>;
  }>
>(
  req: RequestWithLogger,
  parser: Parser
): {
  [k in keyof Parser]: Parser[k] extends z.ZodType<infer O, infer _D, infer _I>
    ? O
    : never;
} =>
  Object.fromEntries([
    ["query", parser.query === undefined ? [] : parseQuery(req, parser.query)],
    ["headers", parser.headers === undefined ? [] : parseHeaders(req, parser.headers)],
    ["body", parser.body === undefined ? [] : parseBody(req, parser.body)],
  ]);
