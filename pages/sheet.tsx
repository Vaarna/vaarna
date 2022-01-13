import { Dispatch, useReducer, useState } from "react";
import { v4 as uuid } from "uuid";
import { DiceRoller } from "@dice-roller/rpg-dice-roller";
import Mustache from "mustache";

const _render = (template: string, env: [string, string][], roll: boolean = true) => {
  let out = template;

  if (template.startsWith("=")) {
    const view = Object.fromEntries(
      env
        .map(([k, v]) => {
          if (!v.startsWith("=")) {
            if (v.startsWith("'=")) return [k, v.substring(1)];
            return [k, v];
          }

          return [
            k,
            () =>
              _render(
                v,
                env.map(([kInner, v]) => [kInner, k === kInner ? "#ERROR?" : v]),
                false
              ),
          ];
        })
        .reverse()
    );

    out = Mustache.render(template.substring(1), view, undefined, {
      escape: (text) => text,
    });
  }

  const d = new DiceRoller();

  try {
    d.roll(out);
    return roll ? d.output : d.total.toString();
  } catch (err) {
    console.error(err);
    return "#ERROR?";
  }
};

const render = (template: string, env: [string, string][]) =>
  _render(template, env, false);
const roll = (template: string, env: [string, string][]) =>
  _render(template, env, true);

type Mode = "display" | "edit" | "edit_template";

type ControllerCheckboxProps = {
  mode: Mode;
  state: ItemBoolean & { valueRendered: string };
  dispatch: DispatchNoId;
};

const ControllerCheckbox: React.FC<ControllerCheckboxProps> = ({
  mode,
  state: { name, valueRendered, onclickEnabled },
  dispatch,
}: ControllerCheckboxProps) => {
  const valueRenderedBool = parseFloat(valueRendered) !== 0;

  if (mode === "display")
    return (
      <div>
        <label>
          {name}: <input type="checkbox" checked={valueRenderedBool} disabled />
        </label>
        <button
          disabled={!onclickEnabled}
          onClick={() => dispatch({ action: "CLICK" })}
        >
          CLICK
        </button>
      </div>
    );
  else if (mode === "edit")
    return (
      <label>
        {name}:{" "}
        <input
          type="checkbox"
          checked={valueRenderedBool}
          onChange={(ev) =>
            dispatch({ action: "SET_VALUE", value: ev.target.checked ? "1" : "0" })
          }
        />
      </label>
    );

  return <div>invalid</div>;
};

type ControllerNumberProps = {
  mode: Mode;
  state: ItemNumber & { valueRendered: string };
  dispatch: DispatchNoId;
};

const ControllerNumber: React.FC<ControllerNumberProps> = ({
  mode,
  state: { key, group, name, value, valueRendered, readOnly, onclickEnabled, onclick },
  dispatch,
}: ControllerNumberProps) => {
  switch (mode) {
    case "display":
      return (
        <div>
          {name}: {valueRendered}
          <button
            disabled={!onclickEnabled}
            onClick={() => dispatch({ action: "CLICK" })}
          >
            CLICK
          </button>
        </div>
      );

    case "edit":
      return (
        <div>
          {name}:{" "}
          {readOnly ? (
            <span>{valueRendered}</span>
          ) : (
            <input
              value={value}
              onChange={(ev) =>
                dispatch({ action: "SET_VALUE", value: ev.target.value })
              }
            />
          )}
        </div>
      );

    case "edit_template":
      return (
        <div>
          <label>
            Group
            <input
              value={group}
              onChange={(ev) =>
                dispatch({ action: "SET_GROUP", group: ev.target.value })
              }
            />
          </label>
          <label>
            Key
            <input
              value={key}
              onChange={(ev) => dispatch({ action: "SET_KEY", key: ev.target.value })}
            />
          </label>
          <label>
            Name
            <input
              value={name}
              onChange={(ev) => dispatch({ action: "SET_NAME", name: ev.target.value })}
            />
          </label>
          <label>
            Value
            <input
              value={value}
              onChange={(ev) =>
                dispatch({ action: "SET_VALUE", value: ev.target.value })
              }
            />
          </label>
          <input
            type="checkbox"
            checked={onclickEnabled}
            onChange={(ev) =>
              dispatch({ action: "SET_ONCLICK_ENABLED", enabled: ev.target.checked })
            }
          />
          <label>
            On Click
            <input
              disabled={!onclickEnabled}
              value={onclick}
              onChange={(ev) =>
                dispatch({ action: "SET_ONCLICK", value: ev.target.value })
              }
            />
          </label>
          <button onClick={() => dispatch({ action: "COPY_ITEM" })}>Copy</button>
          <button onClick={() => dispatch({ action: "REMOVE_ITEM" })}>Remove</button>
        </div>
      );

    default:
      return <div>error</div>;
  }
};

type ItemBase = {
  id: string;
  group: string;
  key: string;
  name: string;
  value: string;
  readOnly: boolean;
  onclickEnabled: boolean;
  onclick: string;
};

type ItemNumber = ItemBase & { type: "number" };
type ItemBoolean = ItemBase & { type: "boolean" };

type Item = ItemNumber | ItemBoolean;

type CollectionState = {
  groups: string[];
  items: Item[];
};

type CollectionActionBase = { id: string };

type CollectionActions =
  | { action: "SET_GROUP"; group: string }
  | { action: "SET_KEY"; key: string }
  | { action: "SET_NAME"; name: string }
  | { action: "SET_VALUE"; value: string }
  | { action: "COPY_ITEM" }
  | { action: "REMOVE_ITEM" }
  | { action: "SET_ONCLICK_ENABLED"; enabled: boolean }
  | { action: "SET_ONCLICK"; value: string }
  | { action: "CLICK" };

type CollectionAction =
  | (CollectionActionBase & CollectionActions)
  | { action: "APPEND_ITEM" };

type DispatchNoId = Dispatch<CollectionActions>;

const collectionReducer = (
  state: CollectionState,
  action: CollectionAction
): CollectionState => {
  switch (action.action) {
    case "SET_GROUP":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, group: action.group } : { ...item }
        ),
      };

    case "SET_KEY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, key: action.key } : { ...item }
        ),
      };

    case "SET_NAME":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, name: action.name } : { ...item }
        ),
      };

    case "SET_VALUE":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, value: action.value } : { ...item }
        ),
      };

    case "SET_ONCLICK_ENABLED":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, onclickEnabled: action.enabled }
            : { ...item }
        ),
      };

    case "SET_ONCLICK":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, onclick: action.value } : { ...item }
        ),
      };

    case "CLICK": {
      state.items
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

      return { ...state };
    }

    case "APPEND_ITEM":
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: uuid(),
            group: "",
            key: "",
            name: "",
            type: "number",
            value: "0",
            readOnly: false,
            onclickEnabled: false,
            onclick: "",
          },
        ],
      };

    case "COPY_ITEM":
      return {
        ...state,
        items: state.items.flatMap((item) =>
          item.id === action.id ? [item, { ...item, id: uuid() }] : [item]
        ),
      };

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.flatMap((item) => (item.id === action.id ? [] : [item])),
      };

    default:
      return { ...state };
  }
};

const collectionInitialState: CollectionState = {
  groups: [],
  items: [
    {
      id: uuid(),
      type: "number",
      group: "",
      key: "str",
      name: "Strength",
      value: "12",
      readOnly: false,
      onclickEnabled: false,
      onclick: "",
    },
    {
      id: uuid(),
      type: "number",
      group: "",
      key: "prof",
      name: "Proficiency Bonus",
      value: "3",
      readOnly: false,
      onclickEnabled: true,
      onclick: "=d20 + {{self}}",
    },
    {
      id: uuid(),
      type: "number",
      group: "",
      key: "str_mod",
      name: "Strength Modifier",
      value: "=floor(({{str}}-10)/2)",
      readOnly: true,
      onclickEnabled: true,
      onclick: "=d20 + {{self}} + {{prof}}",
    },
    {
      id: uuid(),
      type: "boolean",
      group: "",
      key: "athletics",
      name: "Athletics",
      value: "0",
      readOnly: false,
      onclickEnabled: true,
      onclick: "=d20 + {{str_mod}} + {{self}} * {{prof}}",
    },
  ],
};

export default function Sheet(): React.ReactNode {
  const [mode, setMode] = useState<Mode>("display");
  const setDisplay = () => setMode("display");
  const setEdit = () => setMode("edit");
  const setEditTemplate = () => setMode("edit_template");

  const [state, dispatch] = useReducer(collectionReducer, collectionInitialState);

  return (
    <>
      <button disabled={mode === "display"} onClick={setDisplay}>
        display
      </button>
      <button disabled={mode === "edit"} onClick={setEdit}>
        edit
      </button>
      <button disabled={mode === "edit_template"} onClick={setEditTemplate}>
        edit template
      </button>
      {state.items.map((item) => {
        switch (item.type) {
          case "boolean":
            return (
              <ControllerCheckbox
                key={item.id}
                mode={mode}
                state={{
                  ...item,
                  valueRendered: render(
                    item.value,
                    state.items.map((item) => [item.key, item.value])
                  ),
                }}
                dispatch={(v: CollectionActions) => dispatch({ ...v, id: item.id })}
              />
            );

          case "number":
            return (
              <ControllerNumber
                key={item.id}
                mode={mode}
                state={{
                  ...item,
                  valueRendered: render(
                    item.value,
                    state.items.map((item) => [item.key, item.value])
                  ),
                }}
                dispatch={(v: CollectionActions) => dispatch({ ...v, id: item.id })}
              />
            );

          default:
            throw new Error("unreachable");
        }
      })}
      <button
        onClick={() => {
          setEditTemplate();
          dispatch({ action: "APPEND_ITEM" });
        }}
      >
        New Item
      </button>
    </>
  );
}
