import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import { v4 as v4uuid } from "uuid";
import { requestLogger } from "logger";
import { NextApiRequest, NextApiResponse } from "next";
import {
  createAssetData,
  getAsset,
  getKind,
  headAsset,
  uploadAsset,
} from "service/asset";
import { GetAssetHeaders, GetAssetQuery, PostAssetQuery } from "type/asset";
import { ApiError, parseRequest } from "type/error";
import { pathToFileURL } from "url";
import { ParsedMultipartBody, parseMultipartBody } from "util/multipart";

export default async function Asset(req: NextApiRequest, res: NextApiResponse) {
  const [logger, requestId] = requestLogger(req, res);

  async function post(query: PostAssetQuery, body: ParsedMultipartBody) {
    const out = await Promise.all(
      Object.entries(body.files).map(async ([field, file]) => {
        const assetId = v4uuid();
        const kind = getKind(file.headers["content-type"]);
        logger.info({ ...file, assetId, kind }, "uploading file");
        const s = createReadStream(file.path);
        const data = {
          assetId,
          spaceId: query.spaceId,
          filename: file.originalFilename,
          size: file.size,
          contentType: file.headers["content-type"],
        };
        await uploadAsset(s, data);
        await createAssetData({ ...data, kind });

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
        return res.status(204).end();
      }

      case "HEAD": {
        const { query } = parseRequest({
          query: GetAssetQuery,
        })(req, requestId);
        return await headAsset(query, res);
      }

      case "GET": {
        const { query, headers } = parseRequest({
          query: GetAssetQuery,
          headers: GetAssetHeaders,
        })(req, requestId);
        return await getAsset(query, headers, res);
      }

      case "POST": {
        const { query } = parseRequest({
          query: PostAssetQuery,
        })(req, requestId);
        const body = await parseMultipartBody(req);
        const assetIds = await post(query, body);
        res.status(201).json({ assetIds });
        return await Promise.all(
          Object.values(body.files).map(({ path }) =>
            unlink(pathToFileURL(path))
          )
        );
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
