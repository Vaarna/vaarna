import { Selector } from "testcafe";
import { getPage, windowPathname } from "./util";

fixture`Navigation`.page(getPage());

test("header can be used to navigate between pages", async (t) => {
  await t.expect(windowPathname()).eql("/");

  await t.click(Selector("a").withText("Items"));
  await t.expect(windowPathname()).eql("/item");

  await t.click(Selector("a").withText("Assets"));
  await t.expect(windowPathname()).eql("/asset");

  await t.click(Selector("a").withText("Table"));
  await t.expect(windowPathname()).eql("/table");

  await t.click(Selector("a").withText("GM Screen"));
  await t.expect(windowPathname()).eql("/");
});
