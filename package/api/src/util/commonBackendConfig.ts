import type P from "pino";

import { RequestWithLogger } from "@gm-screen/logging";

export type CommonBackendConfig = {
  requestId: string;
  logger: P.Logger;
};

export const commonBackendConfigFromRequest = (
  req: RequestWithLogger
): CommonBackendConfig => {
  return { requestId: req.requestId, logger: req.logger };
};
