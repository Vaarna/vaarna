import { z } from "zod";

import { ApiParseBodyError, ApiParseHeadersError, ApiParseQueryError } from "./error";

type RequestId = { requestId: string };
export type RequestWithQuery = RequestId & { query: unknown };
export type RequestWithHeaders = RequestId & { headers: unknown };
export type RequestWithBody = RequestId & { body: unknown };
export type Request = RequestWithQuery & RequestWithHeaders & RequestWithBody;

export const parseQuery = <T>(req: RequestWithQuery, query: z.ZodType<T>): T => {
  const parsedQuery = query.safeParse(req.query);
  if (!parsedQuery.success) {
    throw new ApiParseQueryError(parsedQuery.error, req.requestId);
  }
  return parsedQuery.data;
};

export const parseHeaders = <T>(req: RequestWithHeaders, headers: z.ZodType<T>): T => {
  const parsedHeaders = headers.safeParse(req.headers);
  if (!parsedHeaders.success) {
    throw new ApiParseHeadersError(parsedHeaders.error, req.requestId);
  }
  return parsedHeaders.data;
};

export const parseBody = <T>(req: RequestWithBody, body: z.ZodType<T>): T => {
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
  req: Request,
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
