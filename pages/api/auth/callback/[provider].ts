import { NextApiResponse } from "next";
import { z } from "zod";
import { AuthService } from "service/auth";
import { RequestWithLogger, withDefaults } from "util/withDefaults";

const Query = z.object({
  provider: z.string(),
  code: z.string(),
  state: z.string().optional(),
});

async function callback(req: RequestWithLogger, res: NextApiResponse): Promise<void> {
  const svc = new AuthService(req);

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

export default withDefaults(["GET"], callback);
