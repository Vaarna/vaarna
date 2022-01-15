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
const ItemTypeUnion = z.union([ItemType.omni, ItemType.boolean, ItemType.range]);

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

export const GroupConfig = z
  .object({
    name: z.string(),
    sortKey: z.string(),
    display: z.union([z.literal("rows"), z.literal("columns")]),
    sortBy: z.array(
      z.union([
        z.literal("sortKey"),
        z.literal("key"),
        z.literal("name"),
        z.literal("valueEvaluated"),
      ])
    ),
    sortOrder: z.union([z.literal("asc"), z.literal("desc")]),
  })
  .partial();

export type GroupConfig = z.infer<typeof GroupConfig>;

// --- Sheet state and dispatch types ---

export const SheetState = z.object({
  id: z.string().uuid(),
  name: z.string(),
  groups: z.record(GroupConfig),
  items: z.array(Item),
});

export type SheetState = z.infer<typeof SheetState>;

type ActionWithId<T> = T & { id: string };
type ActionWithKey<T> = T & { key: string };

export type SheetItemAction =
  | { action: "SET_GROUP"; group: string }
  | { action: "SET_KEY"; key: string }
  | { action: "SET_SORTKEY"; sortKey: string }
  | { action: "SET_NAME"; name: string }
  | { action: "SET_VALUE"; value: string }
  | { action: "SET_READONLY"; readOnly: boolean }
  | { action: "SET_TYPE"; type: string }
  | { action: "SET_MINMAX"; min?: string; max?: string }
  | { action: "COPY_ITEM" }
  | { action: "REMOVE_ITEM" }
  | { action: "SET_ONCLICK_ENABLED"; enabled: boolean }
  | { action: "SET_ONCLICK"; value: string }
  | { action: "CLICK" };

const sheetItemReducer = (
  state: SheetState["items"],
  action: SheetAction
): SheetState["items"] =>
  produce(state, (draft) => {
    switch (action.action) {
      case "SET_GROUP":
        draft.forEach((item) => {
          if (item.id === action.id) item.group = action.group;
        });
        break;

      case "SET_KEY":
        draft.forEach((item) => {
          if (item.id === action.id) item.key = action.key;
        });
        break;

      case "SET_SORTKEY":
        draft.forEach((item) => {
          if (item.id === action.id) item.sortKey = action.sortKey;
        });
        break;

      case "SET_NAME":
        draft.forEach((item) => {
          if (item.id === action.id) item.name = action.name;
        });
        break;

      case "SET_VALUE":
        draft.forEach((item) => {
          if (item.id === action.id) item.value = action.value;
        });
        break;

      case "SET_READONLY":
        draft.forEach((item) => {
          if (item.id === action.id) item.readOnly = action.readOnly;
        });
        break;

      case "SET_TYPE": {
        const parsedType = ItemTypeUnion.safeParse(action.type);
        if (parsedType.success) {
          draft.forEach((item) => {
            if (item.id === action.id) item.type = parsedType.data;
          });
        }
        break;
      }

      case "SET_MINMAX":
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

      case "SET_ONCLICK_ENABLED":
        draft.forEach((item) => {
          if (item.id === action.id) item.onclickEnabled = action.enabled;
        });
        break;

      case "SET_ONCLICK":
        draft.forEach((item) => {
          if (item.id === action.id) item.onclick = action.value;
        });
        break;

      case "CLICK":
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

      case "APPEND_ITEM":
        // TODO: generate uuid on the server side
        draft.push({
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
        });
        break;

      case "COPY_ITEM": {
        // TODO: generate uuid on the server side
        const item = draft.find((item) => item.id === action.id);
        if (item !== undefined) draft.push({ ...item, id: uuid() });
        break;
      }

      case "REMOVE_ITEM": {
        const i = draft.findIndex((item) => item.id === action.id);
        if (i >= 0) draft.splice(i, 1);
        break;
      }
    }
  });

type SheetGroupActionPrefix = "GROUP.";
export type SheetGroupAction =
  | {
      action: `${SheetGroupActionPrefix}SET_NAME`;
      name: GroupConfig["name"];
    }
  | {
      action: `${SheetGroupActionPrefix}SET_DISPLAY`;
      display: GroupConfig["display"];
    }
  | {
      action: `${SheetGroupActionPrefix}SET_SORTBY`;
      sortBy: GroupConfig["sortBy"];
    }
  | {
      action: `${SheetGroupActionPrefix}SET_SORTORDER`;
      sortOrder: GroupConfig["sortOrder"];
    }
  | {
      action: `${SheetGroupActionPrefix}SET_SORTKEY`;
      sortKey: GroupConfig["sortKey"];
    };

const sheetGroupReducer = (
  state: SheetState["groups"],
  action: SheetAction
): SheetState["groups"] =>
  produce(state, (draft) => {
    switch (action.action) {
      case "GROUP.SET_NAME":
        if (!(action.key in state)) draft[action.key] = {};
        draft[action.key].name = action.name;
        break;

      case "GROUP.SET_DISPLAY":
        if (!(action.key in state)) draft[action.key] = {};
        draft[action.key].display = action.display;
        break;

      case "GROUP.SET_SORTBY":
        if (!(action.key in state)) draft[action.key] = {};
        draft[action.key].sortBy = action.sortBy;
        break;

      case "GROUP.SET_SORTORDER":
        if (!(action.key in state)) draft[action.key] = {};
        draft[action.key].sortOrder = action.sortOrder;
        break;

      case "GROUP.SET_SORTKEY":
        if (!(action.key in state)) draft[action.key] = {};
        draft[action.key].sortKey = action.sortKey;
        break;
    }
  });

export type SheetAction =
  | ActionWithId<SheetItemAction>
  | ActionWithKey<SheetGroupAction>
  | { action: "SET_SHEET_NAME"; name: string }
  | { action: "APPEND_ITEM" };

// --- Sheet state and dispatch logic ---

export const sheetStateReducer = (
  state: SheetState,
  action: SheetAction
): SheetState => {
  switch (action.action) {
    case "SET_SHEET_NAME":
      return { ...state, name: action.name };

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

export type SheetGroupedItems = {
  key: string;
  config: GroupConfig;
  items: ItemEvaluated[];
};

const evaluateAndGroupItems = (sheet: SheetState): SheetGroupedItems[] => {
  const out: SheetGroupedItems[] = [
    { key: "", config: sheet.groups[""] ?? {}, items: [] },
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
        key: e.group,
        config: sheet.groups[e.group] ?? {},
        items: [e],
      });
      prevGroup = e.group;
    }
  });

  return out.filter((group) => group.items.length > 0);
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
  const sortOrder = group.config.sortBy ?? ["sortKey", "key", "name"];
  const items = [...group.items].sort(itemCompare(sortOrder));
  if (group.config.sortOrder === "asc") items.reverse();

  return { ...group, items };
};

export const groupItems = (sheet: SheetState): SheetGroupedItems[] =>
  evaluateAndGroupItems(sheet)
    .map((group) => sortGroup(group))
    .sort((a, b) =>
      (a.config?.sortKey ?? "").localeCompare(b.config?.sortKey ?? "", undefined, {
        numeric: true,
      })
    );
