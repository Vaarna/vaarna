import { useReducer, useState } from "react";
import { v4 as uuid } from "uuid";
import { SheetItemAction, SheetState, sheetStateReducer } from "type/sheet";
import { Controller, Mode } from "component/Controller";
import { render } from "render";

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
                valueRendered: render(
                  item.value,
                  state.items.map((item) => [item.key, item.value])
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
