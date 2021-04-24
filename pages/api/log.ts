import { NextApiResponse } from "next";
import { LogService } from "service/log";
import { GetLogQuery, LogEvent } from "type/log";
import { parseRequest } from "util/parseRequest";
import { RequestWithLogger, withDefaults } from "util/withDefaults";

async function log(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new LogService(req);

  // eslint-disable-next-line default-case
  switch (req.method) {
    case "GET": {
      const { query } = parseRequest(req, { query: GetLogQuery });
      const data = await svc.get(query.spaceId);
      return res.status(200).json({ data });
    }

    case "PATCH": {
      const { body } = parseRequest(req, { body: LogEvent });
      const data = await svc.event(body);
      return res.status(200).json({ data });
    }
  }
}

export default withDefaults(["GET", "PATCH"], log);
