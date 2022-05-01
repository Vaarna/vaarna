import { NextApiResponse } from "next";
import { RequestWithLogger, withDefaults } from "util/withDefaults";

async function event(_req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  res.status(500).send("Not Implemented");
  return Promise.resolve();
}

export default withDefaults(["GET", "POST"], event);
