import { NextApiResponse } from "next";
import { RequestWithLogger, withDefaults } from "util/withDefaults";
import { backend } from "api";

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

  // TODO: implement PATCH
  // TODO: implement DELETE
}

export default withDefaults(["GET", "POST"], space);