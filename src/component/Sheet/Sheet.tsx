import styles from "./Sheet.module.css";
import { useState } from "react";
import { SheetState, groupItems } from "util/evalItems";
import { Mode } from "./common";
import { Group } from "./Group";
import classNames from "classnames";
import { setSheetParameters } from "state/slice";
import { useAppDispatch } from "state/hook";
import { newItem } from "state/slice";
import { newGroup } from "state/slice";

export type SheetProps = {
  state: SheetState;
};

export const Sheet: React.FC<SheetProps> = ({ state }: SheetProps) => {
  const dispatch = useAppDispatch();
  const { sheetId } = state;

  const [mode, setMode] = useState<Mode>("display");
  const setDisplay = () => setMode("display");
  const setEdit = () => setMode("edit");
  const setEditTemplate = () => setMode("edit_template");

  const [hidden, _setHidden] = useState(false);
  const toggleHidden = () => {
    _setHidden((prev) => !prev);
    setDisplay();
  };

  const [groupName, setGroupName] = useState("");

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
              dispatch(setSheetParameters({ sheetId, name: ev.target.value }))
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
            key={group.groupId}
            mode={mode}
            group={group}
            groups={state.groups.map((group) => group.key)}
          />
        ))}

        {mode !== "edit_template" ? null : (
          <div className={styles.editButtons}>
            <button
              className={styles.newItem}
              onClick={() => {
                dispatch(newItem({ sheetId }));
              }}
            >
              New Item
            </button>
            <div>
              <input
                type="text"
                value={groupName}
                onChange={(ev) => setGroupName(ev.target.value)}
              />
              <button
                className={styles.newItem}
                onClick={() => {
                  dispatch(newGroup({ sheetId, key: groupName }));
                  setGroupName("");
                }}
              >
                New Group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
