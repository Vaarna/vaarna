import { NextApiResponse } from "next";
import { AssetService } from "@gm-screen/all/src/service/asset";
import { Space } from "@gm-screen/all/src/type/space";
import { parseRequest } from "@gm-screen/all/src/util/parseRequest";
import { RequestWithLogger, withDefaults } from "@gm-screen/all/src/util/withDefaults";
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
