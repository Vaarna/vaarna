import { NextApiResponse } from "next";
import { AuthService } from "service/auth";
import { RequestWithLogger, withDefaults } from "util/withDefaults";

async function signout(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new AuthService(req);

  AuthService.clearSessionCookie(res);

  const sessionId = AuthService.getSessionCookie(req);
  if (sessionId === undefined) {
    res.redirect("/");
    return;
  }

  await svc.signout({ sessionId });
  res.redirect("/");
}

export default withDefaults(["POST"], signout);
