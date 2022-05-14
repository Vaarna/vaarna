import { z } from "zod";
import { evaluate } from "../render";
import { Item, Group, Sheet } from "type/space";

export type ItemEvaluated<T> = T & {
  valueEvaluated: string;
  minEvaluated: string;
  maxEvaluated: string;
};

export const itemToKeyValues = (item: Item): [string, string][] => {
  const out: [string, string][] = [[item.key, item.value]];

  if (item.type === "range") {
    out.push([`${item.key}#min`, item.min ?? ""]);
    out.push([`${item.key}#max`, item.max ?? ""]);
  }

  return out;
};

// --- Sheet state and dispatch types ---

export const SheetState = z.object({
  sheetId: z.string().uuid(),
  name: z.string(),
  groups: z.array(Group),
  items: z.array(Item),
});
export type SheetState = z.infer<typeof SheetState>;

// --- Sheet state and dispatch logic ---

const evaluateItems = (items: Item[]): ItemEvaluated<Item>[] => {
  const env = items.flatMap((item) => itemToKeyValues(item));
  return items.map((item) => ({
    ...item,
    valueEvaluated: evaluate(item.value, env),
    minEvaluated: "min" in item ? evaluate(item.min ?? "", env) : "",
    maxEvaluated: "max" in item ? evaluate(item.max ?? "", env) : "",
  }));
};

export type SheetGroupedItems = Group & {
  items: ItemEvaluated<Item>[];
};

const defaultGroup = (sheetId: Sheet["sheetId"]) => ({
  sheetId,
  groupId: "",
  key: "",
});

const evaluateAndGroupItems = (sheet: SheetState): SheetGroupedItems[] => {
  const out: SheetGroupedItems[] = [
    {
      sheetId: sheet.sheetId,
      groupId: "",
      key: "",
      items: [],
    },
  ];

  const sortedItems = [...sheet.items];
  sortedItems.sort((a, b) => a.group.localeCompare(b.group));

  const evaluatedItems = evaluateItems(sortedItems);

  let prevGroup = "";
  sortedItems.forEach((_item, i) => {
    const e = evaluatedItems[i];
    if (prevGroup === e.group) {
      out[out.length - 1].items.push(e);
    } else {
      out.push({
        ...(sheet.groups.find((group) => group.key === e.group) ??
          defaultGroup(sheet.sheetId)),
        items: [e],
      });
      prevGroup = e.group;
    }
  });

  // add groups that have zero items
  const addedGroups = new Set(out.map((v) => v.key));
  sheet.groups.forEach((group) => {
    if (!addedGroups.has(group.key)) out.push({ items: [], ...group });
  });

  return out;
};

const itemCompare =
  (ks: ("sortKey" | "key" | "name" | "valueEvaluated")[]) =>
  (a: ItemEvaluated<Item>, b: ItemEvaluated<Item>): number => {
    for (const k of ks) {
      if (a[k] !== b[k]) return a[k].localeCompare(b[k], undefined, { numeric: true });
    }
    return a.itemId.localeCompare(b.itemId);
  };

const sortGroup = (group: SheetGroupedItems): SheetGroupedItems => {
  const sortBy = group.sortBy ?? ["sortKey", "key", "name"];
  const items = [...group.items].sort(itemCompare(sortBy));
  if (group.sortOrder === "asc") items.reverse();

  return { ...group, items };
};

export const groupItems = (sheet: SheetState): SheetGroupedItems[] =>
  evaluateAndGroupItems(sheet)
    .map((group) => sortGroup(group))
    .sort((a, b) =>
      (a?.sortKey ?? "").localeCompare(b?.sortKey ?? "", undefined, {
        numeric: true,
      })
    );
