import { NextApiResponse } from "next";
import { AuthService } from "service/auth";
import { RequestWithLogger, withDefaults } from "util/withDefaults";

async function signin(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new AuthService(req);

  const { provider } = req.query;
  if (typeof provider !== "string") {
    return res.status(400).end();
  }

  const url = svc.signinUrl({ provider });
  res.redirect(url);
}

export default withDefaults(["POST"], signin);
