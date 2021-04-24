import { NextApiResponse } from "next";
import { TableService } from "service/table";
import { GetTableQuery, UpdateTableBody } from "type/table";
import { parseRequest } from "util/parseRequest";
import { RequestWithLogger, withDefaults } from "util/withDefaults";

async function table(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new TableService(req);

  // eslint-disable-next-line default-case
  switch (req.method) {
    case "GET": {
      const { query } = parseRequest(req, { query: GetTableQuery });
      const table = await svc.getTable(query.spaceId);
      return res.status(200).json({ table });
    }

    case "POST": {
      const { body } = parseRequest(req, { body: UpdateTableBody });
      const table = await svc.updateTable(body);
      return res.status(200).json({ table });
    }
  }
}

export default withDefaults(["GET", "POST"], table);
