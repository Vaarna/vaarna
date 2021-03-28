import { NextApiRequest, NextApiResponse } from "next";
import { getAsset, headAsset } from "service/asset";
import { GetAssetHeaders, GetAssetQuery } from "type/api";

function head(
  query: NextApiRequest["query"],
  headers: NextApiRequest["headers"],
  res: NextApiResponse
) {
  const parsedQuery = GetAssetQuery.parse(query);
  const parsedHeaders = GetAssetHeaders.parse(headers);

  return headAsset(parsedQuery, parsedHeaders, res);
}

function get(
  query: NextApiRequest["query"],
  headers: NextApiRequest["headers"],
  res: NextApiResponse
) {
  const parsedQuery = GetAssetQuery.parse(query);
  const parsedHeaders = GetAssetHeaders.parse(headers);

  return getAsset(parsedQuery, parsedHeaders, res);
}

export default async function Asset(req: NextApiRequest, res: NextApiResponse) {
  const allow = "OPTIONS, HEAD, GET";

  try {
    switch (req.method) {
      case "OPTIONS":
        res.setHeader("Allow", allow);
        return res.status(204).end();

      case "HEAD":
        return await head(req.query, req.headers, res);

      case "GET":
        return await get(req.query, req.headers, res);

      default:
        res.setHeader("Allow", allow);
        return res.status(405).end();
    }
  } catch (error) {
    res.status(500).end();
  }
}
