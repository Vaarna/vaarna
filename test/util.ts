import { ClientFunction } from "testcafe";

export const windowPathname = ClientFunction(() => window.location.pathname);
