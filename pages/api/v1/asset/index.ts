import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import { v4 as v4uuid } from "uuid";
import { requestLogger } from "logger";
import { NextApiRequest, NextApiResponse } from "next";
import { GetAssetHeaders, GetAssetQuery, PostAssetQuery } from "type/asset";
import { ApiError, parseRequest } from "util/parseRequest";
import { pathToFileURL } from "url";
import { ParsedMultipartBody, parseMultipartBody } from "util/multipart";
import { AssetService } from "service/asset";

export default async function Asset(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const [logger, requestId] = requestLogger(req, res);
  const svc = new AssetService({
    bucket: "gm-screen",
    tableName: "AssetData",
    logger,
  });

  async function post(query: PostAssetQuery, body: ParsedMultipartBody) {
    const out = await Promise.all(
      Object.entries(body.files).map(async ([field, file]) => {
        const assetId = v4uuid();
        const s = createReadStream(file.path);
        const data = {
          assetId,
          spaceId: query.spaceId,
          filename: file.originalFilename,
          size: file.size,
          contentType: file.headers["content-type"],
        };
        await svc.uploadAsset(s, data);

        return [field, assetId];
      })
    );

    return Object.fromEntries(out);
  }

  const allow = "OPTIONS, HEAD, GET, POST";

  try {
    switch (req.method) {
      case "OPTIONS": {
        res.setHeader("Allow", allow);
        res.status(204).end();

        return;
      }

      case "HEAD": {
        const { query } = parseRequest({
          query: GetAssetQuery,
        })(req, requestId);
        const r = await svc.headAsset(query);
        r.write(res);

        return;
      }

      case "GET": {
        const { query, headers } = parseRequest({
          query: GetAssetQuery,
          headers: GetAssetHeaders,
        })(req, requestId);
        const r = await svc.getAsset(query, headers);
        r.write(res);

        return;
      }

      case "POST": {
        const { query } = parseRequest({
          query: PostAssetQuery,
        })(req, requestId);
        const body = await parseMultipartBody(req);
        const assetIds = await post(query, body);
        res.status(201).json({ assetIds });
        await Promise.all(
          Object.values(body.files).map(({ path }) =>
            unlink(pathToFileURL(path))
          )
        );

        return;
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

export const config = {
  api: {
    bodyParser: false,
  },
};
