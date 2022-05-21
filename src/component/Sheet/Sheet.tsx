import { useState } from "react";
import { SheetState } from "util/evalItems";
import { SheetDisplay } from "./SheetDisplay";
import { SheetEditTemplate } from "./SheetEditTemplate";
import { Mode } from "./common";
import styled from "styled-components";
import { CollapsibleGroup } from "component/CollapsibleGroup";

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
  const [mode, setMode] = useState<Mode>("display");
  const setDisplay = () => setMode("display");
  const setEdit = () => setMode("edit");
  const setEditTemplate = () => setMode("edit_template");

  const [hidden, _setHidden] = useState(false);
  const toggleHidden = () => {
    _setHidden((prev) => !prev);
  };

  return (
    <CollapsibleGroup collapsed={hidden}>
      <>
        <SheetName>{state.name}</SheetName>
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
