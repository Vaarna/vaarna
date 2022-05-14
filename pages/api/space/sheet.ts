import { NextApiResponse } from "next";
import { RequestWithLogger, withDefaults } from "util/withDefaults";
import { backend } from "api";

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

  // TODO: implement PATCH
  // TODO: implement DELETE
}

export default withDefaults(["GET", "POST"], sheet);
