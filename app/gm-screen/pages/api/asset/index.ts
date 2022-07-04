import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import { uuid } from "@gm-screen/all/src/util/uuid";
import { NextApiResponse } from "next";
import { parseRequest } from "@gm-screen/all/src/util/parseRequest";
import { pathToFileURL } from "url";
import {
  ParsedMultipartBody,
  parseMultipartBody,
} from "@gm-screen/all/src/util/multipart";
import { AssetService, GetAssetHeaders } from "@gm-screen/all/src/service/asset";
import { RequestWithLogger, withDefaults } from "@gm-screen/all/src/util/withDefaults";
import { AssetData, Space } from "@gm-screen/all/src/type/space";
import { z } from "zod";
import { getCreatedUpdated } from "@gm-screen/all/src/type/createdUpdated";

async function asset(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new AssetService(req);

  async function post(spaceId: Space["spaceId"], body: ParsedMultipartBody) {
    const out = await Promise.all(
      Object.entries(body.files).map(async ([field, file]) => {
        const assetId = uuid();
        const s = createReadStream(file.path);
        const data = {
          assetId,
          spaceId,
          filename: file.originalFilename,
          size: file.size,
          contentType: file.headers["content-type"],
          ...getCreatedUpdated(),
        };
        await svc.uploadAsset(s, data);

        return [field, assetId];
      })
    );

    return Object.fromEntries(out);
  }

  if (req.method === "HEAD") {
    const { query } = parseRequest(req, {
      query: z.object({ assetId: AssetData.shape.assetId }),
    });

    const r = await svc.headAsset(query);
    r.write(res);
  }

  if (req.method === "GET") {
    const { query, headers } = parseRequest(req, {
      query: z.object({ assetId: z.string().uuid() }),
      headers: GetAssetHeaders,
    });

    const r = await svc.getAsset(query, headers);
    r.write(res);
  }

  if (req.method === "POST") {
    const {
      query: { spaceId },
    } = parseRequest(req, {
      query: z.object({ spaceId: Space.shape.spaceId }),
    });

    const body = await parseMultipartBody(req);
    const assetIds = await post(spaceId, body);

    res.status(201).json({ assetIds });

    await Promise.all(
      Object.values(body.files).map(({ path }) => unlink(pathToFileURL(path)))
    );
  }
}

export default withDefaults(["HEAD", "GET", "POST"], asset);

export const config = {
  api: {
    bodyParser: false,
  },
};
