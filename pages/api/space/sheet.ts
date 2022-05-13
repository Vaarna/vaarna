import { NextApiResponse } from "next";
import { CreateSheet } from "type/sheet";
import { parseRequest } from "util/parseRequest";
import { uuid } from "util/uuid";
import { RequestWithLogger, withDefaults } from "util/withDefaults";
import { z } from "zod";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { dynamoDbConfig } from "service/common";

async function space(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  if (req.method === "POST") {
    const db = new DynamoDBClient(dynamoDbConfig(req.logger));

    const {
      query: { spaceId },
      body,
    } = parseRequest(req, {
      query: z.object({ spaceId: z.string().uuid() }),
      body: CreateSheet,
    });

    const sheetId = uuid();

    const cmd = new PutItemCommand({
      TableName: "Data",
      Item: marshall({
        ...body,
        sheetId,
        pk: `space:${spaceId}`,
        sk: `sheet:${sheetId}`,
      }),
    });

    await db.send(cmd);

    return res.json({ spaceId, sheet: { ...body, sheetId } });
  }
}

export default withDefaults(["POST"], space);
