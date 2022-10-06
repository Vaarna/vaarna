import Toucan from "toucan-js";

import { ApiError, ApiNotFoundError } from "@vaarna/type";

export type Env = {
  ENVIRONMENT: "development" | "staging" | "production";
  SENTRY_DSN?: string;
};

export default {
  async fetch(
    request: Request,
    env: Env,
    context: ExecutionContext
  ): Promise<Response> {
    const sentry = new Toucan({
      dsn: env.SENTRY_DSN ?? "",
      context,
      request,
      tracesSampleRate: 1.0,
      environment: env.ENVIRONMENT,
    });

    const url = new URL(request.url);
    const path = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;

    try {
      switch (path) {
        case "space":
          return new Response("Hello, world!");
        default:
          throw new ApiNotFoundError("");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code >= 500) {
          sentry.captureException(err);
        }
        return Response.json(err.json(), { status: err.code });
      }

      sentry.captureException(err);
      throw err;
    }
  },
};
