import { requestLogger } from "logger";
import { NextApiRequest, NextApiResponse } from "next";
import { LogService } from "service/log";
import { ApiInternalServerError } from "type/error";
import { GetLogQuery, LogEvent } from "type/log";
import { ApiError, parseRequest } from "util/parseRequest";

export default async function Log(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const [logger, requestId] = requestLogger(req, res);
  const svc = new LogService({ logger, requestId });

  const allow = "OPTIONS, GET, PATCH";

  try {
    switch (req.method) {
      case "GET": {
        const { query } = parseRequest({ query: GetLogQuery })(req, requestId);
        const data = await svc.get(query.spaceId);
        return res.status(200).json({ data });
      }

      case "PATCH": {
        const { body } = parseRequest({ body: LogEvent })(req, requestId);
        const data = await svc.event(body);
        return res.status(200).json({ data });
      }

      default:
        res.setHeader("Allow", allow);
        return res.status(405).end();
    }
  } catch (error) {
    if (error instanceof ApiError) {
      if (error instanceof ApiInternalServerError) {
        logger.error(error, "internal server error");
      }
      res.status(error.code).json(error.json());
    } else {
      logger.error(error, "internal server error");
      res.status(500).end();
    }
  }
}
