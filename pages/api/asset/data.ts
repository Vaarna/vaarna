import { NextApiResponse } from "next";
import { AssetService } from "service/asset";
import { GetAssetDataQuery } from "type/assetData";
import { parseRequest } from "util/parseRequest";
import { RequestWithLogger, withDefaults } from "util/withDefaults";

async function assetData(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new AssetService(req);

  const { query } = parseRequest(req, {
    query: GetAssetDataQuery,
  });
  return res.json({ data: await svc.getAssetData(query) });
}

export default withDefaults(["GET"], assetData);
