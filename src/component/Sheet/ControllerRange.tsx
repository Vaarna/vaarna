import { ItemRange, SheetItemAction } from "type/sheet";
import { Mode } from "./common";
import { Display, Edit, EditTemplate } from "./modes";
import { FieldString } from "./modes/Field";

export type ControllerRangeProps = {
  mode: Mode;
  state: ItemRange & {
    valueEvaluated: string;
    minEvaluated: string;
    maxEvaluated: string;
  };
  dispatch: React.Dispatch<SheetItemAction>;
};

export const ControllerRange: React.FC<ControllerRangeProps> = ({
  mode,
  state,
  dispatch,
}: ControllerRangeProps) => {
  const leftPadStyle = { paddingLeft: "0.5rem" };
  switch (mode) {
    case "display":
      return (
        <Display state={state} dispatch={dispatch}>
          {state.valueEvaluated}
          {!state.maxEvaluated ? null : ` / ${state.maxEvaluated}`}
        </Display>
      );

    case "edit":
      return (
        <Edit state={state}>
          <>
            <input
              type="number"
              disabled
              min={state.minEvaluated}
              max={state.maxEvaluated}
              value={state.valueEvaluated}
            />
            {!state.maxEvaluated ? null : (
              <span style={leftPadStyle}>/ {state.maxEvaluated}</span>
            )}
          </>
          <>
            <input
              type="number"
              min={state.minEvaluated}
              max={state.maxEvaluated}
              value={state.valueEvaluated}
              onChange={(ev) =>
                dispatch({ action: "SET_VALUE", value: ev.target.value })
              }
            />
            {!state.maxEvaluated ? null : (
              <span style={leftPadStyle}>/ {state.maxEvaluated}</span>
            )}
          </>
        </Edit>
      );

    case "edit_template":
      return (
        <EditTemplate state={state} dispatch={dispatch}>
          <FieldString
            name="Min"
            value={state.minEvaluated}
            onChange={(v) => dispatch({ action: "SET_MINMAX", min: v })}
          />
          <FieldString
            name="Max"
            value={state.maxEvaluated}
            onChange={(v) => dispatch({ action: "SET_MINMAX", max: v })}
          />
        </EditTemplate>
      );
  }
};
