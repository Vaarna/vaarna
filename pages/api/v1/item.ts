import { NextApiRequest, NextApiResponse } from "next";

import { requestLogger } from "logger";
import { createItem, getItems, removeItem, updateItem } from "service/item";
import { GetItemsQuery, RemoveItemQuery } from "type/api";
import { ApiParseError, parseRequest } from "type/error";
import { ItemCreate, ItemUpdate } from "type/item";

export default async function Item(req: NextApiRequest, res: NextApiResponse) {
  const [logger, requestId] = requestLogger(req, res);

  const allow = "OPTIONS, GET, POST, PUT, DELETE";

  try {
    switch (req.method) {
      case "OPTIONS":
        res.setHeader("Allow", allow);
        return res.status(204).end();

      case "GET": {
        const { query } = parseRequest({ query: GetItemsQuery })(
          req,
          requestId
        );
        logger.info(
          { spaceId: query.spaceId, itemId: query.itemId },
          "getting items"
        );
        return res.json({ data: await getItems(query) });
      }

      case "POST": {
        const { body } = parseRequest({ body: ItemCreate })(req, requestId);
        logger.info({ spaceId: body.spaceId }, "creating item");
        return res.json({ data: await createItem(body) });
      }

      case "PUT": {
        const { body } = parseRequest({ body: ItemUpdate })(req, requestId);
        logger.info(
          { spaceId: body.spaceId, itemId: body.itemId },
          "updating item"
        );
        return res.json({ data: await updateItem(body) });
      }

      case "DELETE": {
        const { query } = parseRequest({ query: RemoveItemQuery })(
          req,
          requestId
        );
        logger.info(query, "removing item");
        return res.json({ data: await removeItem(query) });
      }

      default:
        res.setHeader("Allow", allow);
        return res.status(405).end();
    }
  } catch (error) {
    if (error instanceof ApiParseError) {
      res.status(error.code).json(error.json());
    } else {
      res.status(500).end();
    }
  }
}
