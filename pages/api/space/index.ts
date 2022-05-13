import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NextApiResponse } from "next";
import { dynamoDbConfig } from "service/common";
import { Group, Sheet, CreateSpace } from "type/sheet";
import { Item } from "type/space";
import { getItemsFromTable } from "util/dynamodb";
import { parseBody, parseQuery } from "util/parseRequest";
import { RequestWithLogger, withDefaults } from "util/withDefaults";
import { z } from "zod";
import { uuid } from "util/uuid";

// return assets, sheets, items, and groups in given space

const GetSpace = z.object({ spaceId: z.string().uuid() });

async function space(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  if (req.method === "GET") {
    const { spaceId } = parseQuery(req, GetSpace);
    const c = new DynamoDBClient(dynamoDbConfig(req.logger));
    const data = await getItemsFromTable(c, {
      tableName: "Data",
      pk: { prefix: "space:", value: spaceId },
      sk: { value: null },
    }).then(z.array(Sheet.or(Group).or(Item)).parse);

    return res.json(data);
  }

  if (req.method === "POST") {
    const body = parseBody(req, CreateSpace);
    return res.json({ ...body, spaceId: uuid() });
  }
}

export default withDefaults(["GET", "POST"], space);
