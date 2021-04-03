import { requestLogger } from "logger";
import { NextApiRequest, NextApiResponse } from "next";

import { createItem, getItems, removeItem, updateItem } from "service/item";
import { GetItemsQuery, RemoveItemQuery } from "type/api";
import { ItemCreate, ItemUpdate, Items } from "type/item";

export default async function Item(req: NextApiRequest, res: NextApiResponse) {
  const [logger, requestId] = requestLogger(req, res);

  async function get(query: NextApiRequest["query"]) {
    const params = GetItemsQuery.safeParse(query);
    if (!params.success) {
      logger.warn(params.error, "invalid request when trying to get items");

      return res.status(400).json({ error: params.error });
    }

    res.json({ data: await getItems(params.data) });
  }

  async function create(body: NextApiRequest["body"]) {
    logger.info("creating an item");

    const params = ItemCreate.safeParse(body);
    if (!params.success) {
      logger.warn(
        params.error,
        "invalid request body when trying to create an item"
      );

      return res.status(400).json({ error: params.error });
    }

    res.json({ data: await createItem(params.data) });
  }

  async function update(body: NextApiRequest["body"]) {
    logger.info("updating an item");

    const params = ItemUpdate.safeParse(body);
    if (!params.success) {
      logger.warn(
        params.error,
        "invalid request body when trying to update an item"
      );

      return res.status(400).json({ error: params.error });
    }

    res.json({ data: await updateItem(params.data) });
  }

  async function remove(query: NextApiRequest["query"]) {
    logger.info("removing an item");

    const params = RemoveItemQuery.safeParse(query);
    if (!params.success) {
      logger.warn(
        params.error,
        "invalid request when trying to remove an item"
      );

      return res.status(400).json({ error: params.error });
    }

    res.json({ data: await removeItem(params.data) });
  }

  const allow = "OPTIONS, GET, POST, PUT, DELETE";

  try {
    switch (req.method) {
      case "OPTIONS":
        res.setHeader("Allow", allow);
        return res.status(204).end();

      case "GET":
        return await get(req.query);

      case "POST":
        return await create(req.body);

      case "PUT":
        return await update(req.body);

      case "DELETE":
        return await remove(req.query);

      default:
        res.setHeader("Allow", allow);
        return res.status(405).end();
    }
  } catch (error) {
    res.status(500).end();
  }
}
