import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import { v4 as v4uuid } from "uuid";
import { NextApiResponse } from "next";
import { GetAssetHeaders, GetAssetQuery, PostAssetQuery } from "type/asset";
import { parseRequest } from "util/parseRequest";
import { pathToFileURL } from "url";
import { ParsedMultipartBody, parseMultipartBody } from "util/multipart";
import { AssetService } from "service/asset";
import { RequestWithLogger, withDefaults } from "util/withDefaults";

async function asset(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new AssetService(req);

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

  switch (req.method) {
    case "HEAD": {
      const { query } = parseRequest(req, {
        query: GetAssetQuery,
      });
      const r = await svc.headAsset(query);
      r.write(res);

      return;
    }

    case "GET": {
      const { query, headers } = parseRequest(req, {
        query: GetAssetQuery,
        headers: GetAssetHeaders,
      });
      const r = await svc.getAsset(query, headers);
      r.write(res);

      return;
    }

    case "POST": {
      const { query } = parseRequest(req, {
        query: PostAssetQuery,
      });
      const body = await parseMultipartBody(req);
      const assetIds = await post(query, body);
      res.status(201).json({ assetIds });
      await Promise.all(
        Object.values(body.files).map(({ path }) => unlink(pathToFileURL(path)))
      );

      return;
    }
  }
}

export default withDefaults(["HEAD", "GET", "POST"], asset);

export const config = {
  api: {
    bodyParser: false,
  },
};
