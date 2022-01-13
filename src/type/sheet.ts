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

export const Item = z.union([ItemOmni, ItemBoolean]);
export type Item = z.infer<typeof Item>;

// --- Sheet state and dispatch types ---

export type SheetState = {
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
  | { action: "COPY_ITEM" }
  | { action: "REMOVE_ITEM" }
  | { action: "SET_ONCLICK_ENABLED"; enabled: boolean }
  | { action: "SET_ONCLICK"; value: string }
  | { action: "CLICK" };

export type SheetAction =
  | (SheetItemActionBase & SheetItemAction)
  | { action: "APPEND_ITEM" };

// --- Sheet state and dispatch logic ---

export const sheetStateReducer = (state: SheetState, action: SheetAction): SheetState =>
  produce(state, (draft) => {
    switch (action.action) {
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
          .union([z.literal("omni"), z.literal("boolean")])
          .safeParse(action.type);
        if (parsedType.success) {
          draft.items.forEach((item) => {
            if (item.id === action.id) item.type = parsedType.data;
          });
        }
        break;
      }

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
          .forEach((item) =>
            console.log(
              roll(
                item.onclick,
                [["self", item.value] as [string, string]].concat(
                  state.items.map((item) => [item.key, item.value])
                )
              )
            )
          );
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

export const emptySheetState: SheetState = {
  groups: [],
  items: [],
};
