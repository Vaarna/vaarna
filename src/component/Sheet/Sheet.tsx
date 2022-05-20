import { useState } from "react";
import { SheetState } from "util/evalItems";
import { SheetDisplay } from "./SheetDisplay";
import { SheetEditTemplate } from "./SheetEditTemplate";
import { Mode } from "./common";
import styled, { css } from "styled-components";

const Container = styled.div`
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 4px 4px 4px 0 lightgray;
`;

const Header = styled.div`
  padding: 0.5rem;
  background-color: lightgray;
  border-radius: 0.5rem 0.5rem 0 0;
  display: flex;
  justify-content: space-between;
`;

type Hide = { hide: boolean };

const Body = styled.div<Hide>`
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  ${(props) =>
    props.hide
      ? css`
          height: 0.5rem;
          overflow: clip;
        `
      : ""}
`;

const SheetName = styled.div`
  font-size: x-large;
  font-weight: 700;
  padding-left: 0.5rem;
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
    <Container>
      <Header>
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
      </Header>
      <Body hide={hidden}>
        {mode === "display" || mode === "edit" ? (
          <SheetDisplay state={state} edit={mode === "edit"} />
        ) : null}
        {mode === "edit_template" ? <SheetEditTemplate state={state} /> : null}
      </Body>
    </Container>
  );
};
