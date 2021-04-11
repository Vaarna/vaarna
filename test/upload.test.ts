import { readFileSync } from "fs";
import { Selector } from "testcafe";
import { v4 as v4uuid } from "uuid";
import { getPage } from "./util";

fixture`Upload`.page(getPage());

const spaceId = v4uuid();
const now = new Date().getTime() / 1000;
const blob = Uint8Array.from(readFileSync("./test/lena.png"));

test("dropping a file to the page uploads it", async (t) => {
  await t.typeText(Selector("label").withText("Space ID"), spaceId);

  await t.eval(
    () => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(
        new File([blob], "lena-drop.png", { type: "image/png", lastModified: now })
      );
      const dropEvent = new DragEvent("drop", { dataTransfer });
      window.dispatchEvent(dropEvent);
    },
    { dependencies: { blob, now } }
  );

  await t.expect(Selector("div").withText("lena-drop.png").exists).ok();
  await t.expect(Selector("div").withText("File(s) uploaded!").exists).ok();
});

test("pasting a file to the page uploads it", async (t) => {
  await t.typeText(Selector("label").withText("Space ID"), spaceId);
  const { name } = t.browser;
  await t.eval(
    () => {
      let pasteEvent: ClipboardEvent;

      if (name === "Firefox") {
        // on (at least) firefox, you can't set the clipboardData when creating
        // the event, but you must instead add the data to the created event
        pasteEvent = new ClipboardEvent("paste");
        pasteEvent.clipboardData.items.add(
          new File([blob], "lena-paste.png", { type: "image/png", lastModified: now })
        );
      } else {
        const clipboardData = new DataTransfer();
        clipboardData.items.add(
          new File([blob], "lena-paste.png", { type: "image/png", lastModified: now })
        );

        pasteEvent = new ClipboardEvent("paste", { clipboardData });
      }

      document.body.dispatchEvent(pasteEvent);
    },
    { dependencies: { blob, now, name } }
  );

  await t.expect(Selector("div").withText("lena-paste.png").exists).ok();
  await t.expect(Selector("div").withText("File(s) uploaded!").exists).ok();
});

test("an uploaded image can be shown on the table", async (t) => {
  await t.typeText(Selector("label").withText("Space ID"), spaceId);
  await t.click(Selector("a").withText("Asset"));
  await t.click(Selector("button").withText("Show"));
  await t.click(Selector("a").withText("Table"));
  await t.expect(Selector("img").exists).ok();
});
