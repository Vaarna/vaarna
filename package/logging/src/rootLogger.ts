import P from "pino";

export const rootLogger = P({
  nestedKey: "data",
  redact: [
    "request.headers.authorization",
    "request.headers.cookie",
    "response.headers['set-cookie']",
  ],
});
