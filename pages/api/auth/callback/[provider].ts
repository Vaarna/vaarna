import { requestLogger } from "logger";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { AuthService } from "service/auth";
import config from "config";

const Query = z.object({
  provider: z.string(),
  code: z.string(),
  state: z.string().optional(),
});

export default async function signin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const allow = "OPTIONS, GET";

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", allow);
    return res.status(204).end();
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", allow);
    return res.status(405).end();
  }

  const [logger, requestId] = requestLogger(req, res);
  const svc = new AuthService({
    tableNameUser: config.USER_TABLE,
    tableNameSession: config.SESSION_TABLE,
    logger,
    requestId,
  });

  const { provider, code, state } = Query.parse(req.query);
  const resp = await svc.callback({
    provider,
    code,
    state,
    userAgent: req.headers["user-agent"],
  });
  res.setHeader("Set-Cookie", resp.cookie);
  res.redirect(resp.redirect ?? "/");
}
