import { NextApiRequest, NextApiResponse } from "next";
import P from "pino";
import { z, ZodError } from "zod";

import { ApiError } from "@gm-screen/type";

import { requestLogger } from "./requestLogger";

export type RequestWithLogger = NextApiRequest & {
  requestId: string;
  logger: P.Logger;
};

type HandlerIn = (req: RequestWithLogger, res: NextApiResponse) => Promise<void>;
type HandlerOut = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

type Method = "HEAD" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function withDefaults(methods: Method[], h: HandlerIn): HandlerOut {
  return async (req, res) => {
    const [logger, requestId] = requestLogger(req, res);
    const ms: Set<string> = new Set(methods);
    const allow = Array.from(ms).join(", ");

    if (req.method === "OPTIONS") {
      res.setHeader("Allow", allow);
      res.status(204).end();
    }

    if (!ms.has(req.method ?? "")) {
      res.setHeader("Allow", allow);
      res.status(405).end();
    }

    try {
      (req as RequestWithLogger).logger = logger;
      (req as RequestWithLogger).requestId = requestId;

      await h(req as RequestWithLogger, res);
    } catch (err) {
      if (err instanceof ApiError) {
        res.status(err.code).json(err.json());
      } else if (err instanceof ZodError) {
        logger.error(err, "uncaught ZodError");
        res.status(500).json(err.issues);
      } else {
        const parsedErr = z
          .object({ message: z.string() })
          .passthrough()
          .safeParse(err);

        if (parsedErr.success) logger.error(parsedErr.data, parsedErr.data.message);
        else logger.error({ thrown: err }, "handler threw a non-Error object");

        res.status(500).end();
      }
    }
  };
}
