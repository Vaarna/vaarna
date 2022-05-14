import { NextApiResponse } from "next";
import { CreateSheet, Space } from "type/space";
import { parseRequest } from "util/parseRequest";
import { RequestWithLogger, withDefaults } from "util/withDefaults";
import { z } from "zod";
import { SpaceService } from "service/space";
import { QueryParameterStringUuid } from "type/query";

async function sheet(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new SpaceService(req);

  if (req.method === "GET") {
    // TODO: find out why this does not work
    // const { spaceId, sheetId } = parseQuery(
    //   req,
    //   z.object({
    //     spaceId: Space.shape.spaceId,
    //     sheetId: QueryParameterStringUuid,
    //   })
    // );

    const {
      query: { spaceId, sheetId },
    } = parseRequest(req, {
      query: z.object({
        spaceId: Space.shape.spaceId,
        sheetId: QueryParameterStringUuid,
      }),
    });

    const sheet = await svc.getSheet(spaceId, sheetId);

    return res.json({ sheet });
  }

  if (req.method === "POST") {
    const {
      query: { spaceId },
      body,
    } = parseRequest(req, {
      query: z.object({ spaceId: Space.shape.spaceId }),
      body: CreateSheet,
    });

    const sheet = await svc.createSheet(spaceId, body);

    return res.json({ sheet });
  }

  // TODO: implement PATCH
  // TODO: implement DELETE
}

export default withDefaults(["POST"], sheet);
