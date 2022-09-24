import { RequestWithLogger } from "@vaarna/logging";
import type P from "pino";

export type CommonBackendConfig = {
  requestId: string;
  logger: P.Logger;
};

export const commonBackendConfigFromRequest = (
  req: RequestWithLogger
): CommonBackendConfig => {
  return { requestId: req.requestId, logger: req.logger };
};
