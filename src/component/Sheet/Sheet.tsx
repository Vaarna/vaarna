import { useEffect, useState } from "react";
import { SheetState } from "util/evalItems";
import { SheetDisplay } from "./SheetDisplay";
import { SheetEditTemplate } from "./SheetEditTemplate";
import { Mode } from "./common";
import styled from "styled-components";
import { CollapsibleGroup } from "component/CollapsibleGroup";
import { useAppDispatch, useAppSelector } from "state/hook";
import { selectSpaceId, updateSheet } from "state/slice";

const SheetName = styled.div`
  font-size: x-large;
  font-weight: 700;
  padding-left: ${({ theme }) => theme.margin.normal};
`;

const EditButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

export type SheetProps = {
  state: SheetState;
};

export const Sheet: React.FC<SheetProps> = ({ state }: SheetProps) => {
  const dispatch = useAppDispatch();

  const [mode, setMode] = useState<Mode>("display");
  const setDisplay = () => setMode("display");
  const setEdit = () => setMode("edit");
  const setEditTemplate = () => setMode("edit_template");

  const [hidden, _setHidden] = useState(false);
  const toggleHidden = () => {
    _setHidden((prev) => !prev);
  };

  const spaceId = useAppSelector(selectSpaceId);

  const [sheetName, setSheetName] = useState(state.name);
  useEffect(() => {
    const t = setTimeout(() => {
      if (spaceId === null) return;
      dispatch(updateSheet({ spaceId, sheetId: state.sheetId, name: sheetName }));
    }, 500);

    return () => clearTimeout(t);
  }, [sheetName, dispatch, state.sheetId, spaceId]);

  return (
    <CollapsibleGroup collapsed={hidden}>
      <>
        <SheetName>
          {mode === "display" ? (
            state.name
          ) : (
            <input value={sheetName} onChange={(ev) => setSheetName(ev.target.value)} />
          )}
        </SheetName>
        <EditButtons>
          <button onClick={() => toggleHidden()}>{hidden ? "v" : "^"}</button>
          <button disabled={mode === "display"} onClick={() => setDisplay()}>
            display
          </button>
          <button disabled={mode === "edit"} onClick={() => setEdit()}>
            edit
          </button>
          <button disabled={mode === "edit_template"} onClick={() => setEditTemplate()}>
            edit template
          </button>
        </EditButtons>
      </>
      <>
        {mode === "display" || mode === "edit" ? (
          <SheetDisplay state={state} edit={mode === "edit"} />
        ) : null}
        {mode === "edit_template" ? <SheetEditTemplate state={state} /> : null}
      </>
    </CollapsibleGroup>
  );
};
