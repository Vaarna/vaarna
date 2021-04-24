import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { dynamoDbConfig } from "service/common";
import { NextApiResponse } from "next";
import { RequestWithLogger, withDefaults } from "util/withDefaults";

async function session(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const db = new DynamoDBClient(dynamoDbConfig(req.logger));

  const sessionId = req.cookies["__Host-sessionId"];

  if (typeof sessionId !== "string") {
    return res.status(400).end();
  }

  const cmd = new GetItemCommand({
    TableName: "Session",
    Key: marshall({ sessionId }),
  });

  const resp = await db.send(cmd);
  if (resp.Item) {
    return res.status(200).json(unmarshall(resp.Item));
  }

  return res.status(404).end();
}

export default withDefaults(["GET"], session);
