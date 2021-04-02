import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import { getAsset, headAsset, postAsset } from "service/asset";
import { GetAssetHeaders, GetAssetQuery, PostAssetQuery } from "type/api";
import { pathToFileURL } from "url";
import { ParsedMultipartBody, parseMultipartBody } from "util/multipart";

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

async function post(body: ParsedMultipartBody) {
  const out = await Promise.all(
    Object.entries(body.files).map(async ([field, file]) => {
      console.log("uploading file", file);
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

export default async function Asset(req: NextApiRequest, res: NextApiResponse) {
  const allow = "OPTIONS, HEAD, GET, POST";

  try {
    switch (req.method) {
      case "OPTIONS":
        res.setHeader("Allow", allow);
        return res.status(204).end();

      case "HEAD":
        return await head(req.query, req.headers, res);

      case "GET":
        return await get(req.query, req.headers, res);

      case "POST":
        const body = await parseMultipartBody(req);
        res.status(201).json({ assetIds: await post(body) });
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
    res.status(500).end();
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
