import { NextApiResponse } from "next";

import { backend } from "@vaarna/api";
import { RequestWithLogger, withDefaults } from "@vaarna/logging";

async function space(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const conf = backend.dynamoDbConfigFromRequest(req);

  if (req.method === "GET") {
    const data = await backend.getSpace(req, conf);
    return res.json(data);
  }

  if (req.method === "POST") {
    const data = await backend.createSpace(req, conf);
    return res.json(data);
  }

  if (req.method === "PATCH") {
    const data = await backend.updateSpace(req, conf);
    return res.json(data);
  }

  // TODO: implement DELETE
}

export default withDefaults(["GET", "POST", "PATCH"], space);
