import { NextApiResponse } from "next";
import { AssetService } from "service/asset";
import { Space } from "type/space";
import { parseRequest } from "util/parseRequest";
import { RequestWithLogger, withDefaults } from "util/withDefaults";
import { z } from "zod";

async function assetData(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new AssetService(req);

  const { query } = parseRequest(req, {
    query: z.object({
      spaceId: Space.shape.spaceId,
      assetId: z.array(z.string()).or(z.string()),
    }),
  });
  return res.json({ data: await svc.getAssetData(query) });
}

export default withDefaults(["GET"], assetData);
