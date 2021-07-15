import { ClientFunction, Selector } from "testcafe";

export const windowPathname = ClientFunction(() => window.location.pathname);
export const getPage = (path: string = "/"): string =>
  (process.env.DOMAIN ?? "http://localhost:3000") + path;

export const setSpaceId = (t: TestController, spaceId: string): TestControllerPromise =>
  t.typeText(Selector("#spaceId"), spaceId);
