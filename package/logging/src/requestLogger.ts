import { uuid } from "@vaarna/util";
import { NextApiRequest, NextApiResponse } from "next";
import P from "pino";

import { rootLogger } from "./rootLogger";

export function requestLogger(
  req: NextApiRequest,
  res: NextApiResponse
): [P.Logger, string] {
  const t0 = process.hrtime.bigint();

  const xRequestId = req.headers["x-request-id"];
  let requestId;
  if (typeof xRequestId === "string") requestId = xRequestId;
  else requestId = uuid();

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
