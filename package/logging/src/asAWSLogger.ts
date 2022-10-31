import P from "pino";

type AWSLogger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (...content: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (...content: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (...content: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (...content: any[]) => void;
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
