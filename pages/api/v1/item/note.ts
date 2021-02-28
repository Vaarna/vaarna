import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as v4uuid } from "uuid";

import { ItemNote } from "type/item";

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).end();

  const params = ItemNote.omit({
    itemId: true,
    created: true,
    updated: true,
    version: true,
    type: true,
  }).safeParse(req.body);
  if (!params.success) {
    return res.status(400).json(params.error);
  }

  const now = new Date().toISOString();

  const db = new DynamoDBClient({});
  const cmd = new PutItemCommand({
    TableName: "ItemsDev",
    Item: marshall({
      ...params.data,
      itemId: v4uuid(),
      type: "note",
      created: now,
      updated: now,
      version: 0,
    }),
  });

  return db
    .send(cmd)
    .then((v) => {
      res.status(200).json(v);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
