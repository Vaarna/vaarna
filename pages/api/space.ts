import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NextApiResponse } from "next";
import { dynamoDbConfig } from "service/common";
import { SpaceItem } from "type/space";
import { getItemsFromTable } from "util/dynamodb";
import { parseQuery } from "util/parseRequest";
import { RequestWithLogger, withDefaults } from "util/withDefaults";
import { z } from "zod";

// return assets, sheets, and logs in given space

const GetSpace = z.object({ spaceId: z.string().uuid() });

async function space(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  if (req.method === "GET") {
    const { spaceId } = parseQuery(req, GetSpace);
    const c = new DynamoDBClient(dynamoDbConfig(req.logger));
    const data = await getItemsFromTable(c, {
      tableName: "Data",
      pk: { prefix: "space:", value: spaceId },
      sk: { value: null },
    }).then(z.array(SpaceItem).parseAsync);

    return res.json(data);
  }

  if (req.method === "POST") {
    return res.json({ v: "created new space with id" });
  }
}

export default withDefaults(["GET", "POST"], space);
