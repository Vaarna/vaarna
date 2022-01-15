import styles from "./Sheet.module.css";
import { useState } from "react";
import { SheetState, SheetAction, groupItems, SheetGroupAction } from "type/sheet";
import { Mode } from "./common";
import { Group } from "./Group";
import classNames from "classnames";

export type SheetProps = {
  state: SheetState;
  dispatch: React.Dispatch<SheetAction>;
};

export const Sheet: React.FC<SheetProps> = ({ state, dispatch }: SheetProps) => {
  const [mode, setMode] = useState<Mode>("display");
  const setDisplay = () => setMode("display");
  const setEdit = () => setMode("edit");
  const setEditTemplate = () => setMode("edit_template");

  const [hidden, _setHidden] = useState(false);
  const toggleHidden = () => {
    _setHidden((prev) => !prev);
    setDisplay();
  };

  const groups = groupItems(state);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {mode === "display" ? (
          <h2>{state.name}</h2>
        ) : (
          <input
            value={state.name}
            onChange={(ev) =>
              dispatch({ action: "SET_SHEET_NAME", name: ev.target.value })
            }
          />
        )}
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
          <button onClick={toggleHidden}>{hidden ? "v" : "^"}</button>
        </div>
      </div>

      <div className={classNames({ [styles.body]: true, [styles.hidden]: hidden })}>
        {groups.map((group) => (
          <Group
            key={group.key}
            mode={mode}
            group={group}
            dispatch={dispatch}
            groupDispatch={(v: SheetGroupAction) => dispatch({ ...v, key: group.key })}
          />
        ))}

        {mode !== "edit_template" ? null : (
          <button
            className={styles.newItem}
            onClick={() => {
              setEditTemplate();
              dispatch({ action: "APPEND_ITEM" });
            }}
          >
            New Item
          </button>
        )}
      </div>
    </div>
  );
};
