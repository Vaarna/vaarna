import { requestLogger } from "logger";
import { NextApiRequest, NextApiResponse } from "next";
import { TableService } from "service/table";
import { ApiInternalServerError } from "type/error";
import { GetTableQuery, UpdateTableBody } from "type/table";
import { ApiError, parseRequest } from "util/parseRequest";

export default async function handle_table(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const [logger, requestId] = requestLogger(req, res);
  const svc = new TableService({ logger, requestId });

  const allow = "OPTIONS, GET, POST, DELETE";

  try {
    switch (req.method) {
      case "OPTIONS":
        res.setHeader("Allow", allow);
        return res.status(204).end();

      case "GET": {
        const { query } = parseRequest({ query: GetTableQuery })(req, requestId);
        const table = await svc.getTable(query.spaceId);
        return res.status(200).json({ table });
      }

      case "POST": {
        const { body } = parseRequest({ body: UpdateTableBody })(req, requestId);
        const table = await svc.updateTable(body);
        return res.status(200).json({ table });
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
