import { NextApiRequest, NextApiResponse } from "next";

import { createItem, getItems, removeItem, updateItem } from "service/item";
import { GetItemsQuery, RemoveItemQuery } from "type/api";
import { ItemCreate, ItemUpdate, Items } from "type/item";

function get(query: NextApiRequest["query"]): Promise<Items> {
  const params = GetItemsQuery.parse(query);
  return getItems(params);
}

function create(body: NextApiRequest["body"]) {
  const params = ItemCreate.parse(body);
  return createItem(params);
}

function update(body: NextApiRequest["body"]) {
  const params = ItemUpdate.parse(body);
  return updateItem(params);
}

function remove(query: NextApiRequest["query"]) {
  const params = RemoveItemQuery.parse(query);
  return removeItem(params);
}

export default async function Item(req: NextApiRequest, res: NextApiResponse) {
  const allow = "OPTIONS, GET, POST, PUT, DELETE";

  try {
    switch (req.method) {
      case "OPTIONS":
        res.setHeader("Allow", allow);
        return res.status(204).end();

      case "GET":
        return res.json({ data: await get(req.query) });

      case "POST":
        return res.json({ data: await create(req.body) });

      case "PUT":
        return res.json({ data: await update(req.body) });

      case "DELETE":
        return res.json({ data: await remove(req.query) });

      default:
        res.setHeader("Allow", allow);
        return res.status(405).end();
    }
  } catch (error) {
    res.status(500).end();
  }
}
