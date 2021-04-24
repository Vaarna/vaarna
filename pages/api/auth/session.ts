import { NextApiResponse } from "next";
import { RequestWithLogger, withDefaults } from "util/withDefaults";
import { AuthService } from "service/auth";

async function session(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new AuthService(req);

  const sessionId = AuthService.getSessionCookie(req);

  if (typeof sessionId !== "string") {
    return res.status(400).end();
  }

  const session = await svc.getSession(sessionId);
  res.status(200).json(session);
}

export default withDefaults(["GET"], session);
