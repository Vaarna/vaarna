import { NextApiResponse } from "next";
import { ItemService } from "service/item";
import { parseRequest } from "util/parseRequest";
import { ItemCreate, ItemUpdate, GetItemsQuery, RemoveItemQuery } from "type/item";
import { RequestWithLogger, withDefaults } from "util/withDefaults";

async function item(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new ItemService(req);

  // eslint-disable-next-line default-case
  switch (req.method) {
    case "GET": {
      const { query } = parseRequest(req, { query: GetItemsQuery });
      req.logger.info(
        { spaceId: query.spaceId, itemId: query.itemId },
        "getting items"
      );
      return res.json({ data: await svc.getItems(query) });
    }

    case "POST": {
      const { body } = parseRequest(req, { body: ItemCreate });
      req.logger.info({ spaceId: body.spaceId }, "creating item");
      return res.json({ data: await svc.createItem(body) });
    }

    case "PUT": {
      const { body } = parseRequest(req, { body: ItemUpdate });
      req.logger.info({ spaceId: body.spaceId, itemId: body.itemId }, "updating item");
      return res.json({ data: await svc.updateItem(body) });
    }

    case "DELETE": {
      const { query } = parseRequest(req, { query: RemoveItemQuery });
      req.logger.info(query, "removing item");
      return res.json({ data: await svc.removeItem(query) });
    }
  }
}

export default withDefaults(["GET", "POST", "PUT", "DELETE"], item);
