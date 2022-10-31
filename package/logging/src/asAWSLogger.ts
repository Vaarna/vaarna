import P from "pino";

type AWSLogger = {
  debug: (...content: never[]) => void;
  info: (...content: never[]) => void;
  warn: (...content: never[]) => void;
  error: (...content: never[]) => void;
};

type AWSClient = "DynamoDB" | "S3";
export function asAWSLogger(client: AWSClient, logger: P.Logger): AWSLogger {
  const l = logger.child({ client });
  return {
    debug: (...v) => l.trace({}, ...v),
    info: (...v) => l.debug({}, ...v),
    warn: (...v) => l.warn({}, ...v),
    error: (...v) => l.error({}, ...v),
  };
}
