import config from "config";
import { requestLogger } from "logger";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthService } from "service/auth";

export default async function signin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const allow = "OPTIONS, POST";

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", allow);
    return res.status(204).end();
  }
  if (req.method !== "POST") {
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

  const { provider } = req.query;
  if (typeof provider !== "string") {
    return res.status(400).end();
  }

  const url = svc.signinUrl({ provider });
  res.redirect(url);
}
