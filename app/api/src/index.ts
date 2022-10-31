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
          return handleSpace(request, env, sentry);
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

type Handler = (request: Request, env: Env, sentry: Toucan) => Promise<Response>;

function defaults(supportedMethods: string[], handler: Handler): Handler {
  const ms = new Set(supportedMethods);
  const allow = Array.from(ms).join(", ");

  return async (req, env, ctx) => {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { allow },
      });
    }

    if (!ms.has(req.method)) {
      return new Response(null, {
        status: 405,
        headers: { allow },
      });
    }

    return handler(req, env, ctx);
  };
}

const handleSpace = defaults(
  ["GET", "POST", "PATCH", "DELETE"],
  async (req, _env, _sentry) => {
    return new Response(req.method, { status: 200 });
  }
);
