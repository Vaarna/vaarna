import { z } from "zod";
import { produce } from "immer";
import { v4 as uuid } from "uuid";
import { roll } from "../render";

export const ItemShared = z.object({
  id: z.string().uuid(),
  group: z.string(),
  key: z.string(),
  name: z.string(),
  value: z.string(),
  readOnly: z.boolean(),
  onclickEnabled: z.boolean(),
  onclick: z.string(),
});

export type ItemShared = z.infer<typeof ItemShared>;

export const ItemOmni = ItemShared.merge(
  z.object({
    type: z.literal("omni"),
  })
);

export type ItemOmni = z.infer<typeof ItemOmni>;

export const ItemBoolean = ItemShared.merge(
  z.object({
    type: z.literal("boolean"),
  })
);

export type ItemBoolean = z.infer<typeof ItemBoolean>;

export const ItemRange = ItemShared.merge(
  z.object({
    type: z.literal("range"),
    min: z.string(),
    max: z.string(),
  })
);

export type ItemRange = z.infer<typeof ItemRange>;

export const Item = z.union([ItemOmni, ItemBoolean, ItemRange]);
export type Item = z.infer<typeof Item>;

export const itemToKeyValues = (item: Item): [string, string][] => {
  const out: [string, string][] = [[item.key, item.value]];

  if (item.type === "range") {
    out.push([`${item.key}#min`, item.min]);
    out.push([`${item.key}#max`, item.max]);
  }

  return out;
};

// --- Sheet state and dispatch types ---

export type SheetState = {
  id: string;
  name: string;
  groups: string[];
  items: Item[];
};

type SheetItemActionBase = { id: string };

export type SheetItemAction =
  | { action: "SET_GROUP"; group: string }
  | { action: "SET_KEY"; key: string }
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

export type SheetAction =
  | (SheetItemActionBase & SheetItemAction)
  | { action: "SET_SHEET_NAME"; name: string }
  | { action: "APPEND_ITEM" };

// --- Sheet state and dispatch logic ---

export const sheetStateReducer = (state: SheetState, action: SheetAction): SheetState =>
  produce(state, (draft) => {
    switch (action.action) {
      case "SET_SHEET_NAME":
        draft.name = action.name;
        break;

      case "SET_GROUP":
        draft.items.forEach((item) => {
          if (item.id === action.id) item.group = action.group;
        });
        break;

      case "SET_KEY":
        draft.items.forEach((item) => {
          if (item.id === action.id) item.key = action.key;
        });
        break;

      case "SET_NAME":
        draft.items.forEach((item) => {
          if (item.id === action.id) item.name = action.name;
        });
        break;

      case "SET_VALUE":
        draft.items.forEach((item) => {
          if (item.id === action.id) item.value = action.value;
        });
        break;

      case "SET_READONLY":
        draft.items.forEach((item) => {
          if (item.id === action.id) item.readOnly = action.readOnly;
        });
        break;

      case "SET_TYPE": {
        const parsedType = z
          .union([z.literal("omni"), z.literal("boolean"), z.literal("range")])
          .safeParse(action.type);
        if (parsedType.success) {
          draft.items.forEach((item) => {
            if (item.id === action.id) item.type = parsedType.data;
          });
        }
        break;
      }

      case "SET_MINMAX":
        draft.items.forEach((item) => {
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
        draft.items.forEach((item) => {
          if (item.id === action.id) item.onclickEnabled = action.enabled;
        });
        break;

      case "SET_ONCLICK":
        draft.items.forEach((item) => {
          if (item.id === action.id) item.onclick = action.value;
        });
        break;

      case "CLICK":
        // TODO: actually do something useful here...
        draft.items
          .filter((item) => item.id === action.id && item.onclickEnabled)
          .forEach((item) => {
            try {
              console.log(
                roll(item.onclick, [
                  ["self", item.value],
                  ...state.items.map((item): [string, string] => [
                    item.key,
                    item.value,
                  ]),
                ]).output
              );
            } catch (err) {
              console.error(err);
            }
          });

        break;

      case "APPEND_ITEM":
        // TODO: generate uuid on the server side
        draft.items.push({
          id: uuid(),
          group: "",
          key: "",
          name: "",
          type: "omni",
          value: "0",
          readOnly: false,
          onclickEnabled: false,
          onclick: "",
        });
        break;

      case "COPY_ITEM":
        // TODO: generate uuid on the server side
        draft.items = draft.items.flatMap((item) =>
          item.id === action.id ? [item, { ...item, id: uuid() }] : [item]
        );
        break;

      case "REMOVE_ITEM":
        draft.items = draft.items.flatMap((item) =>
          item.id === action.id ? [] : [item]
        );
        break;

      default:
        break;
    }
  });
