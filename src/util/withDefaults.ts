import { requestLogger } from "logger";
import { NextApiRequest, NextApiResponse } from "next";
import P from "pino";
import { ApiError } from "type/error";

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
    } catch (error) {
      logger.error(error, error.message);

      if (error instanceof ApiError) {
        res.status(error.code).json(error.json());
      } else {
        res.status(500).end();
      }
    }
  };
}
