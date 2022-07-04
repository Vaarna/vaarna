import P from "pino";

type AWSLogger = {
  debug: (_: never) => void;
  info: (_: never) => void;
  warn: (_: never) => void;
  error: (_: never) => void;
};

type AWSClient = "DynamoDB" | "S3";
export function asAWSLogger(client: AWSClient, logger: P.Logger): AWSLogger {
  const l = logger.child({ client });
  return {
    debug: (v) => l.trace(v, client),
    info: (v) => l.debug(v, client),
    warn: (v) => l.warn(v, client),
    error: (v) => l.error(v, client),
  };
}
