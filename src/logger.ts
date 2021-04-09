import { v4 as v4uuid } from "uuid";
import { NextApiRequest, NextApiResponse } from "next";
import P from "pino";

export const rootLogger = P({
  nestedKey: "data",
  redact: [
    "request.headers.authorization",
    "request.headers.cookie",
    "response.headers['set-cookie']",
  ],
});

type AWSLogger = {
  debug: (_: never) => void;
  info: (_: never) => void;
  warn: (_: never) => void;
  error: (_: never) => void;
};

export function asAWSLogger(logger: P.Logger): AWSLogger {
  return {
    debug: logger.trace,
    info: logger.debug,
    warn: logger.warn,
    error: logger.error,
  };
}

export function requestLogger(
  req: NextApiRequest,
  res: NextApiResponse
): [P.Logger, string] {
  const t0 = process.hrtime.bigint();

  const requestId = v4uuid();
  const out = rootLogger.child({
    requestId,
  });

  out
    .child({
      request: {
        method: req.method,
        query: req.query,
        headers: req.headers,
        url: req.url,
        httpVersion: req.httpVersion,
      },
    })
    .info("new request");

  res.addListener("close", () => {
    const t1 = process.hrtime.bigint();
    const td = t1 - t0;

    out
      .child({
        response: { statusCode: res.statusCode, headers: res.getHeaders() },
        responseTime: {
          nanoSeconds: td.toString(),
          milliSeconds: Number(td) / 1_000_000,
        },
      })
      .info("response has been sent");
  });

  return [out, requestId];
}
