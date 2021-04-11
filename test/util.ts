import { ClientFunction } from "testcafe";

export const windowPathname = ClientFunction(() => window.location.pathname);
export const getPage = (path: string = "/"): string =>
  (process.env.DOMAIN ?? "http://localhost:3000") + path;
