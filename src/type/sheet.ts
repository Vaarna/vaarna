import { z } from "zod";
import { produce } from "immer";
import { v4 as uuid } from "uuid";
import { evaluate, roll } from "../render";

export const ItemShared = z.object({
  id: z.string().uuid(),
  group: z.string(),
  key: z.string(),
  sortKey: z.string(),
  name: z.string(),
  value: z.string(),
  readOnly: z.boolean(),
  onclickEnabled: z.boolean(),
  onclick: z.string(),
});

export type ItemShared = z.infer<typeof ItemShared>;

const ItemType = {
  omni: z.literal("omni"),
  boolean: z.literal("boolean"),
  range: z.literal("range"),
};

export const ItemTypeUnion = z.union([ItemType.omni, ItemType.boolean, ItemType.range]);

export const ItemOmni = ItemShared.merge(
  z.object({
    type: ItemType.omni,
  })
);

export type ItemOmni = z.infer<typeof ItemOmni>;

export const ItemBoolean = ItemShared.merge(
  z.object({
    type: ItemType.boolean,
  })
);

export type ItemBoolean = z.infer<typeof ItemBoolean>;

export const ItemRange = ItemShared.merge(
  z.object({
    type: ItemType.range,
    min: z.string(),
    max: z.string(),
  })
);

export type ItemRange = z.infer<typeof ItemRange>;

export const Item = z.union([ItemOmni, ItemBoolean, ItemRange]);
export type Item = z.infer<typeof Item>;

export type ItemEvaluated = Item & {
  valueEvaluated: string;
  minEvaluated: string;
  maxEvaluated: string;
};

export const itemToKeyValues = (item: Item): [string, string][] => {
  const out: [string, string][] = [[item.key, item.value]];

  if (item.type === "range") {
    out.push([`${item.key}#min`, item.min]);
    out.push([`${item.key}#max`, item.max]);
  }

  return out;
};

const display = {
  rows: z.literal("rows"),
  columns: z.literal("columns"),
};

export const DisplayUnion = z.union([display.rows, display.columns]);

const sortBy = {
  sortKey: z.literal("sortKey"),
  key: z.literal("key"),
  name: z.literal("name"),
  valueEvaluated: z.literal("valueEvaluated"),
};

export const SortByUnion = z.union([
  sortBy.sortKey,
  sortBy.key,
  sortBy.name,
  sortBy.valueEvaluated,
]);

const sortOrder = {
  asc: z.literal("asc"),
  desc: z.literal("desc"),
};

export const SortOrderUnion = z.union([sortOrder.asc, sortOrder.desc]);

export const Group = z
  .object({
    name: z.string(),
    sortKey: z.string(),
    display: DisplayUnion,
    sortBy: z.array(SortByUnion),
    sortOrder: SortOrderUnion,
  })
  .partial()
  .merge(
    z.object({
      id: z.union([z.literal(""), z.string().uuid()]),
      key: z.string(),
    })
  );

export type Group = z.infer<typeof Group>;

// --- Sheet state and dispatch types ---

export const SheetState = z.object({
  id: z.string().uuid(),
  name: z.string(),
  groups: z.array(Group),
  items: z.array(Item),
});

export type SheetState = z.infer<typeof SheetState>;

type ActionWithId<T> = T & { id: string };

export type SheetItemAction =
  | { action: "ITEM.SET_GROUP"; group: Item["group"] }
  | { action: "ITEM.SET_KEY"; key: Item["key"] }
  | { action: "ITEM.SET_SORTKEY"; sortKey: Item["sortKey"] }
  | { action: "ITEM.SET_NAME"; name: Item["name"] }
  | { action: "ITEM.SET_VALUE"; value: Item["value"] }
  | { action: "ITEM.SET_READONLY"; readOnly: Item["readOnly"] }
  | { action: "ITEM.SET_TYPE"; type: Item["type"] }
  | { action: "ITEM.SET_MINMAX"; min: ItemRange["min"]; max: ItemRange["max"] }
  | { action: "ITEM.COPY" }
  | { action: "ITEM.REMOVE" }
  | { action: "ITEM.SET_ONCLICK_ENABLED"; onclickEnabled: Item["onclickEnabled"] }
  | { action: "ITEM.SET_ONCLICK"; onclick: Item["onclick"] }
  | { action: "ITEM.CLICK" };

const sheetItemReducer = (
  state: SheetState["items"],
  action: SheetAction
): SheetState["items"] =>
  produce(state, (draft) => {
    switch (action.action) {
      case "ITEM.SET_GROUP":
        draft.forEach((item) => {
          if (item.id === action.id) item.group = action.group;
        });
        break;

      case "ITEM.SET_KEY":
        draft.forEach((item) => {
          if (item.id === action.id) item.key = action.key;
        });
        break;

      case "ITEM.SET_SORTKEY":
        draft.forEach((item) => {
          if (item.id === action.id) item.sortKey = action.sortKey;
        });
        break;

      case "ITEM.SET_NAME":
        draft.forEach((item) => {
          if (item.id === action.id) item.name = action.name;
        });
        break;

      case "ITEM.SET_VALUE":
        draft.forEach((item) => {
          if (item.id === action.id) item.value = action.value;
        });
        break;

      case "ITEM.SET_READONLY":
        draft.forEach((item) => {
          if (item.id === action.id) item.readOnly = action.readOnly;
        });
        break;

      case "ITEM.SET_TYPE": {
        const parsedType = ItemTypeUnion.safeParse(action.type);
        if (parsedType.success) {
          draft.forEach((item) => {
            if (item.id === action.id) item.type = parsedType.data;
          });
        }
        break;
      }

      case "ITEM.SET_MINMAX":
        draft.forEach((item) => {
          if (item.id === action.id) {
            if (item.type !== "range") {
              console.error(`tried to set min/max of item with type ${item.type}`);
            } else {
              item.min = action.min ?? item.min;
              item.max = action.max ?? item.max;
            }
          }
        });
        break;

      case "ITEM.SET_ONCLICK_ENABLED":
        draft.forEach((item) => {
          if (item.id === action.id) item.onclickEnabled = action.onclickEnabled;
        });
        break;

      case "ITEM.SET_ONCLICK":
        draft.forEach((item) => {
          if (item.id === action.id) item.onclick = action.onclick;
        });
        break;

      case "ITEM.CLICK":
        // TODO: actually do something useful here...
        draft
          .filter((item) => item.id === action.id && item.onclickEnabled)
          .forEach((item) => {
            try {
              console.log(
                roll(item.onclick, [
                  ["self", item.value],
                  ...draft.map((item): [string, string] => [item.key, item.value]),
                ]).output
              );
            } catch (err) {
              console.error(err);
            }
          });
        break;

      case "ITEM.COPY": {
        // TODO: generate uuid on the server side
        const item = draft.find((item) => item.id === action.id);
        if (item !== undefined) draft.push({ ...item, id: uuid() });
        break;
      }

      case "ITEM.REMOVE": {
        const i = draft.findIndex((item) => item.id === action.id);
        if (i >= 0) draft.splice(i, 1);
        break;
      }
    }
  });

export type SheetGroupAction =
  | { action: "GROUP.SET_KEY"; key: Group["key"] }
  | { action: "GROUP.SET_NAME"; name: Group["name"] }
  | { action: "GROUP.SET_DISPLAY"; display: Group["display"] }
  | { action: "GROUP.SET_SORTBY"; sortBy: Group["sortBy"] }
  | { action: "GROUP.SET_SORTORDER"; sortOrder: Group["sortOrder"] }
  | { action: "GROUP.SET_SORTKEY"; sortKey: Group["sortKey"] };

const sheetGroupReducer = (
  state: SheetState["groups"],
  action: SheetAction
): SheetState["groups"] =>
  produce(state, (draft) => {
    switch (action.action) {
      case "GROUP.SET_NAME":
        if (action.id === "") break;
        draft.forEach((group) => {
          if (group.id === action.id) group.name = action.name;
        });
        break;

      case "GROUP.SET_DISPLAY":
        if (action.id === "") break;
        draft.forEach((group) => {
          if (group.id === action.id) group.display = action.display;
        });
        break;

      case "GROUP.SET_SORTBY":
        if (action.id === "") break;
        draft.forEach((group) => {
          if (group.id === action.id) group.sortBy = action.sortBy;
        });
        break;

      case "GROUP.SET_SORTORDER":
        if (action.id === "") break;
        draft.forEach((group) => {
          if (group.id === action.id) group.sortOrder = action.sortOrder;
        });
        break;

      case "GROUP.SET_SORTKEY":
        if (action.id === "") break;
        draft.forEach((group) => {
          if (group.id === action.id) group.sortKey = action.sortKey;
        });
        break;
    }
  });

export type SheetAction =
  | ActionWithId<SheetItemAction>
  | ActionWithId<SheetGroupAction>
  | { action: "SHEET.SET_NAME"; name: SheetState["name"] }
  | { action: "SHEET.NEW_ITEM" }
  | { action: "SHEET.NEW_GROUP"; key: Group["key"] };

// --- Sheet state and dispatch logic ---

export const sheetStateReducer = (
  state: SheetState,
  action: SheetAction
): SheetState => {
  switch (action.action) {
    case "SHEET.SET_NAME":
      return { ...state, name: action.name };

    case "SHEET.NEW_ITEM":
      // TODO: generate item on the server side
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: uuid(),
            group: "",
            key: "",
            sortKey: "",
            name: "",
            type: "omni",
            value: "0",
            readOnly: false,
            onclickEnabled: false,
            onclick: "",
          },
        ],
      };

    case "SHEET.NEW_GROUP":
      return {
        ...state,
        groups: [...state.groups, { id: uuid(), name: "", key: action.key }],
      };

    default:
      return {
        ...state,
        groups: sheetGroupReducer(state.groups, action),
        items: sheetItemReducer(state.items, action),
      };
  }
};

// ---

const evaluateItems = (items: Item[]): ItemEvaluated[] => {
  const env = items.flatMap(itemToKeyValues);
  return items.map((item) => ({
    ...item,
    valueEvaluated: evaluate(item.value, env),
    minEvaluated: "min" in item ? evaluate(item.min, env) : "",
    maxEvaluated: "max" in item ? evaluate(item.max, env) : "",
  }));
};

export type SheetGroupedItems = Group & {
  items: ItemEvaluated[];
};

const defaultGroup: Group = {
  id: "",
  key: "",
};

const evaluateAndGroupItems = (sheet: SheetState): SheetGroupedItems[] => {
  const out: SheetGroupedItems[] = [
    {
      id: "",
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
        ...(sheet.groups.find((group) => group.key === e.group) ?? defaultGroup),
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
  (a: ItemEvaluated, b: ItemEvaluated): number => {
    for (const k of ks) {
      if (a[k] !== b[k]) return a[k].localeCompare(b[k], undefined, { numeric: true });
    }
    return a.id.localeCompare(b.id);
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
