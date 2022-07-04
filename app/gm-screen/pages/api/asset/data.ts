import { NextApiResponse } from "next";
import { z } from "zod";

import { AssetService } from "@gm-screen/all/dist/service/asset";
import { RequestWithLogger, withDefaults } from "@gm-screen/logging";
import { parseRequest, Space } from "@gm-screen/type";

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
