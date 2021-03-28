import { v4 as v4uuid } from "uuid";
import pino from "pino";
import { NextApiRequest, NextApiResponse } from "next";

export type { Logger } from "pino";
export const rootLogger = pino({
  nestedKey: "data",
  redact: [
    "request.headers.authorization",
    "request.headers.cookie",
    "response.headers['set-cookie']",
  ],
});

export function requestLogger(req: NextApiRequest, res: NextApiResponse) {
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

  return out;
}
