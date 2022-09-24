import { AssetService } from "@vaarna/all/src/service/asset";
import { RequestWithLogger, withDefaults } from "@vaarna/logging";
import { parseRequest, Space } from "@vaarna/type";
import { NextApiResponse } from "next";
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
