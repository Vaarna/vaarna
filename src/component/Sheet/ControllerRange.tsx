import { ItemEvaluated, ItemRange, SheetItemAction } from "type/sheet";
import { Mode } from "./common";
import { Display, Edit, EditTemplate } from "./modes";
import { FieldString } from "./modes/Field";

export type ControllerRangeProps = {
  mode: Mode;
  state: ItemEvaluated<ItemRange>;
  groups: string[];
  dispatch: React.Dispatch<SheetItemAction>;
};

export const ControllerRange: React.FC<ControllerRangeProps> = ({
  mode,
  state,
  groups,
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
                dispatch({ action: "ITEM.SET_VALUE", value: ev.target.value })
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
        <EditTemplate state={state} groups={groups} dispatch={dispatch}>
          <FieldString
            name="Min"
            value={state.min}
            onChange={(v) =>
              dispatch({ action: "ITEM.SET_MINMAX", min: v, max: state.max })
            }
          />
          <FieldString
            name="Max"
            value={state.max}
            onChange={(v) =>
              dispatch({ action: "ITEM.SET_MINMAX", min: state.min, max: v })
            }
          />
        </EditTemplate>
      );
  }
};
