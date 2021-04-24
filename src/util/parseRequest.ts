import { z } from "zod";
import {
  ApiParseQueryError,
  ApiParseHeadersError,
  ApiParseBodyError,
  ApiError,
} from "type/error";
import { RequestWithLogger } from "./withDefaults";

export { ApiError };

export const parseRequest = <
  Query,
  Headers,
  Body,
  Parser extends Partial<{
    query: z.ZodType<Query>;
    headers: z.ZodType<Headers>;
    body: z.ZodType<Body>;
  }>,
  Out extends {
    [k in keyof Parser]: Parser[k] extends z.ZodType<
      infer Output,
      infer _Def,
      infer _Input
    >
      ? Output
      : never;
  }
>(
  req: RequestWithLogger,
  parser: Parser
): Out => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any = {};

  if (parser.query !== undefined) {
    const parsedQuery = parser.query.safeParse(req.query);
    if (!parsedQuery.success) {
      throw new ApiParseQueryError(parsedQuery.error, req.requestId);
    }
    out.query = parsedQuery.data;
  }

  if (parser.headers !== undefined) {
    const parsedHeaders = parser.headers.safeParse(req.headers);
    if (!parsedHeaders.success) {
      throw new ApiParseHeadersError(parsedHeaders.error, req.requestId);
    }
    out.headers = parsedHeaders.data;
  }

  if (parser.body !== undefined) {
    const parsedBody = parser.body.safeParse(req.body);
    if (!parsedBody.success) {
      throw new ApiParseBodyError(parsedBody.error, req.requestId);
    }
    out.body = parsedBody.data;
  }

  return out;
};
