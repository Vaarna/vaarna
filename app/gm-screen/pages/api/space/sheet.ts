import { NextApiResponse } from "next";

import { backend } from "@gm-screen/all/dist/api";
import { RequestWithLogger, withDefaults } from "@gm-screen/all/dist/util/withDefaults";

async function sheet(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const conf = backend.dynamoDbConfigFromRequest(req);

  if (req.method === "GET") {
    const data = await backend.getSheet(req, conf);
    return res.json(data);
  }

  if (req.method === "POST") {
    const data = await backend.createSheet(req, conf);
    return res.json(data);
  }

  if (req.method === "PATCH") {
    const data = await backend.updateSheet(req, conf);
    return res.json(data);
  }

  // TODO: implement DELETE
}

export default withDefaults(["GET", "POST", "PATCH"], sheet);
