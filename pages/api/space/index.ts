import { NextApiResponse } from "next";
import { CreateSpace, Space } from "type/space";
import { parseBody, parseQuery } from "util/parseRequest";
import { RequestWithLogger, withDefaults } from "util/withDefaults";
import { z } from "zod";
import { SpaceService } from "service/space";

async function space(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new SpaceService(req);

  if (req.method === "GET") {
    const { spaceId } = parseQuery(req, z.object({ spaceId: Space.shape.spaceId }));

    const space = await svc.getSpace(spaceId);

    return res.json(space);
  }

  if (req.method === "POST") {
    const body = parseBody(req, CreateSpace);

    const space = await svc.createSpace(body);

    return res.json(space);
  }

  // TODO: implement PATCH
  // TODO: implement DELETE
}

export default withDefaults(["GET", "POST"], space);
