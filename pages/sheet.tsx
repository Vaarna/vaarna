import { useReducer, useState } from "react";
import { v4 as uuid } from "uuid";
import { Item, SheetItemAction, SheetState, sheetStateReducer } from "type/sheet";
import { Controller, Mode } from "component/Controller";
import { evaluate } from "render";

const collectionInitialState: SheetState = {
  groups: [],
  items: [
    {
      id: uuid(),
      type: "omni",
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
      type: "omni",
      group: "",
      key: "con",
      name: "Constitution",
      value: "13",
      readOnly: false,
      onclickEnabled: false,
      onclick: "",
    },
    {
      id: uuid(),
      type: "range",
      group: "",
      key: "hp",
      name: "HP",
      value: "22",
      readOnly: false,
      onclickEnabled: false,
      onclick: "",
      min: "0",
      max: "={{level}} * (ceil(({{hit_die}} + 1) / 2) + {{con_mod}})",
    },
    {
      id: uuid(),
      type: "omni",
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
      type: "omni",
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
      type: "range",
      group: "",
      key: "level",
      name: "Level",
      value: "3",
      min: "1",
      max: "20",
      readOnly: false,
      onclickEnabled: false,
      onclick: "",
    },
    {
      id: uuid(),
      type: "omni",
      group: "",
      key: "hit_die",
      name: "Hit Die",
      value: "10",
      readOnly: false,
      onclickEnabled: true,
      onclick: "=d{{self}} + {{prof}}",
    },
    {
      id: uuid(),
      type: "omni",
      group: "",
      key: "con_mod",
      name: "Constitution Modifier",
      value: "=floor(({{con}}-10)/2)",
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

const itemToKeyValues = (item: Item): [string, string][] => {
  const out: [string, string][] = [[item.key, item.value]];

  if (item.type === "range") {
    out.push([`${item.key}#min`, item.min]);
    out.push([`${item.key}#max`, item.max]);
  }

  return out;
};

export default function Sheet(): React.ReactNode {
  const [mode, setMode] = useState<Mode>("display");
  const setDisplay = () => setMode("display");
  const setEdit = () => setMode("edit");
  const setEditTemplate = () => setMode("edit_template");

  const [state, dispatch] = useReducer(sheetStateReducer, collectionInitialState);

  return (
    <>
      <div>
        <button disabled={mode === "display"} onClick={setDisplay}>
          display
        </button>
        <button disabled={mode === "edit"} onClick={setEdit}>
          edit
        </button>
        <button disabled={mode === "edit_template"} onClick={setEditTemplate}>
          edit template
        </button>
      </div>

      <hr />

      <div>
        {state.items.map((item) => (
          <div key={item.id} style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <Controller
              mode={mode}
              state={{
                ...item,
                valueRendered: evaluate(
                  item.value,
                  state.items.flatMap(itemToKeyValues)
                ),
                minRendered: evaluate(
                  "min" in item ? item.min : "",
                  state.items.flatMap(itemToKeyValues)
                ),
                maxRendered: evaluate(
                  "max" in item ? item.max : "",
                  state.items.flatMap(itemToKeyValues)
                ),
              }}
              dispatch={(v: SheetItemAction) => dispatch({ ...v, id: item.id })}
            />
          </div>
        ))}
      </div>

      <hr />
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
