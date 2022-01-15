import { useState } from "react";
import { SheetState, SheetAction, SheetItemAction, itemToKeyValues } from "type/sheet";
import { evaluate } from "render";
import { Mode } from "./common";
import { Controller } from "./Controller";

export type SheetProps = {
  state: SheetState;
  dispatch: React.Dispatch<SheetAction>;
};

export const Sheet: React.FC<SheetProps> = ({ state, dispatch }: SheetProps) => {
  const [mode, setMode] = useState<Mode>("display");
  const setDisplay = () => setMode("display");
  const setEdit = () => setMode("edit");
  const setEditTemplate = () => setMode("edit_template");

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
};
