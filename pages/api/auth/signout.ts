import { NextApiResponse } from "next";
import { AuthService } from "service/auth";
import { RequestWithLogger, withDefaults } from "util/withDefaults";
import { z } from "zod";

async function signout(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new AuthService(req);

  AuthService.clearSessionCookie(res);

  const sessionId = AuthService.getSessionCookie(req);
  if (sessionId === undefined) {
    res.redirect("/");
    return;
  }

  try {
    await svc.signout({ sessionId });
  } catch (err) {
    const parsedErr = z.object({ message: z.string() }).passthrough().safeParse(err);
    req.logger.error(
      parsedErr.success ? parsedErr.data : { thrown: err },
      "failed to complete signout on the backend: %s",
      parsedErr.success ? parsedErr.data.message : ""
    );
  } finally {
    res.redirect("/");
  }
}

export default withDefaults(["POST"], signout);
