import { NextApiResponse } from "next";
import { RequestWithLogger, withDefaults } from "util/withDefaults";
import { backend } from "api";

async function group(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const conf = backend.dynamoDbConfigFromRequest(req);

  if (req.method === "GET") {
    const data = await backend.getGroup(req, conf);
    return res.json(data);
  }

  if (req.method === "POST") {
    const data = await backend.createGroup(req, conf);
    return res.json(data);
  }

  if (req.method === "PATCH") {
    const data = await backend.updateGroup(req, conf);
    return res.json(data);
  }

  // TODO: implement DELETE
}

export default withDefaults(["GET", "POST", "PATCH"], group);
