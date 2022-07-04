import { NextApiResponse } from "next";

import { backend } from "@gm-screen/api";
import { RequestWithLogger, withDefaults } from "@gm-screen/logging";

async function item(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const conf = backend.dynamoDbConfigFromRequest(req);

  if (req.method === "GET") {
    const data = await backend.getItem(req, conf);
    return res.json(data);
  }

  if (req.method === "POST") {
    const data = await backend.createItem(req, conf);
    return res.json(data);
  }

  if (req.method === "PATCH") {
    const data = await backend.updateItem(req, conf);
    return res.json(data);
  }

  // TODO: implement DELETE
}

export default withDefaults(["GET", "POST", "PATCH"], item);
