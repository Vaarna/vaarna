import { requestLogger } from "logger";
import { NextApiRequest, NextApiResponse } from "next";
import { getAssetData } from "service/asset";
import { GetAssetDataQuery } from "type/assetData";
import { ApiError, parseRequest } from "util/parseRequest";

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const [logger, requestId] = requestLogger(req, res);

  const allow = "OPTIONS, GET";

  try {
    switch (req.method) {
      case "OPTIONS":
        res.setHeader("Allow", allow);
        return res.status(204).end();

      case "GET": {
        const { query } = parseRequest({
          query: GetAssetDataQuery,
        })(req, requestId);
        return res.json({ data: await getAssetData(query) });
      }

      default:
        res.setHeader("Allow", allow);
        return res.status(405).end();
    }
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.code).json(error.json());
    } else {
      logger.error(error, "internal server error");
      res.status(500).end();
    }
  }
}
