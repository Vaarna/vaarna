import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import { requestLogger } from "logger";
import { NextApiRequest, NextApiResponse } from "next";
import { getAsset, headAsset, postAsset } from "service/asset";
import { GetAssetHeaders, GetAssetQuery } from "type/asset";
import { ApiParseError, parseRequest } from "type/error";
import { pathToFileURL } from "url";
import { ParsedMultipartBody, parseMultipartBody } from "util/multipart";

export default async function Asset(req: NextApiRequest, res: NextApiResponse) {
  const [logger, requestId] = requestLogger(req, res);

  async function post(body: ParsedMultipartBody) {
    const out = await Promise.all(
      Object.entries(body.files).map(async ([field, file]) => {
        logger.info(file, "uploading file");
        const s = createReadStream(file.path);
        const key = await postAsset(s, {
          filename: file.originalFilename,
          size: file.size,
          contentType: file.headers["content-type"],
        });

        return [field, key];
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
        const { query, headers } = parseRequest({
          query: GetAssetQuery,
          headers: GetAssetHeaders,
        })(req, requestId);
        return await headAsset(query, headers, res);
      }

      case "GET": {
        const { query, headers } = parseRequest({
          query: GetAssetQuery,
          headers: GetAssetHeaders,
        })(req, requestId);
        return await getAsset(query, headers, res);
      }

      case "POST":
        const body = await parseMultipartBody(req);
        const assetIds = await post(body);
        res.status(201).json({ assetIds });
        return await Promise.all(
          Object.values(body.files).map(({ path }) =>
            unlink(pathToFileURL(path))
          )
        );

      default:
        res.setHeader("Allow", allow);
        return res.status(405).end();
    }
  } catch (error) {
    if (error instanceof ApiParseError) {
      res.status(error.code).json(error.json());
    } else {
      res.status(500).end();
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
