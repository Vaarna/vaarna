import { z } from "zod";
import { evaluate } from "../render";
import { Item, Group } from "type/space";
import { sortBy } from "util/sortBy";
import { getCreatedUpdated } from "type/createdUpdated";

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

const evaluateAndGroupItems = (sheet: SheetState): SheetGroupedItems[] => {
  // find every group key used by items, skip all group keys with empty value
  const allGroupKeys = new Set(
    sheet.items.filter((item) => item.group.length > 0).map((item) => item.group)
  );

  // find every group key which exists, skip all group keys with empty value
  const allExistingGroups = new Set(
    sheet.groups.filter((group) => group.key.length > 0).map((group) => group.key)
  );

  // every key that is used by an item and has a group
  const allUsedGroupKeys = new Set(
    [...allGroupKeys].filter((x) => allExistingGroups.has(x))
  );

  const groupKeyToGroupId: Record<string, string | undefined> = Object.fromEntries(
    [...allUsedGroupKeys].map((groupKey) => [
      groupKey,
      sheet.groups.find((group) => group.key === groupKey)?.groupId,
    ])
  );

  // default group is used for items with empty group key
  const defaultGroup: SheetGroupedItems = {
    sheetId: sheet.sheetId,
    groupId: "",
    key: "",
    ...getCreatedUpdated(),
    items: [],
  };

  // mapping of groupId to group, includes every group
  const groups: Record<string, SheetGroupedItems> = Object.fromEntries(
    sheet.groups.map((group) => [group.groupId, { ...group, items: [] }])
  );

  // for every evaluated item,
  // if the items group exists, add it to that group,
  // otherwise add it to the default group
  evaluateItems(sheet.items).forEach((item) => {
    const groupId = groupKeyToGroupId[item.group];

    if (groupId === undefined) return defaultGroup.items.push(item);

    const group = groups[groupId];
    if (group === undefined) {
      console.error(
        "invariant broken: could not find a group for an item which should have had a group"
      );
      return defaultGroup.items.push(item);
    }

    group.items.push(item);
  });

  const sortedGroups = sortBy(Object.values(groups), [
    { key: "sortKey", numeric: true },
    { key: "key", numeric: true },
    { key: "name", numeric: true },
    "groupId",
  ]);

  return [defaultGroup, ...sortedGroups];
};

const sortGroupItems = (group: SheetGroupedItems): SheetGroupedItems => {
  const sortOrder = [
    ...(group.sortBy ?? ["sortKey", "key", "name"]).map((key) => ({
      key,
      numeric: true,
    })),
    "itemId",
  ];

  const items = sortBy([...group.items], sortOrder);
  if (group.sortOrder === "asc") items.reverse();

  return { ...group, items };
};

export const groupItems = (sheet: SheetState): SheetGroupedItems[] =>
  evaluateAndGroupItems(sheet).map((group) => sortGroupItems(group));
