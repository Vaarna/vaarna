import { ItemRange, SheetItemAction } from "type/sheet";
import { Mode } from "./common";
import { Display, Edit, EditTemplate } from "./modes";
import { FieldString } from "./modes/Field";

export type ControllerRangeProps = {
  mode: Mode;
  state: ItemRange & {
    valueRendered: string;
    minRendered: string;
    maxRendered: string;
  };
  dispatch: React.Dispatch<SheetItemAction>;
};

export const ControllerRange: React.FC<ControllerRangeProps> = ({
  mode,
  state,
  dispatch,
}: ControllerRangeProps) => {
  switch (mode) {
    case "display":
      return (
        <Display state={state} dispatch={dispatch}>
          <input value={`${state.valueRendered}/${state.maxRendered}`} disabled />
        </Display>
      );

    case "edit":
      return (
        <Edit state={state}>
          <>
            <input
              type="number"
              disabled
              min={state.minRendered}
              max={state.maxRendered}
              value={state.valueRendered}
            />
            <span>/ {state.maxRendered}</span>
          </>
          <>
            <input
              type="number"
              min={state.minRendered}
              max={state.maxRendered}
              value={state.valueRendered}
              onChange={(ev) =>
                dispatch({ action: "SET_VALUE", value: ev.target.value })
              }
            />
            <span>/ {state.maxRendered}</span>
          </>
        </Edit>
      );

    case "edit_template":
      return (
        <EditTemplate state={state} dispatch={dispatch}>
          <FieldString
            name="Min"
            value={state.minRendered}
            onChange={(v) => dispatch({ action: "SET_MINMAX", min: v })}
          />
          <FieldString
            name="Max"
            value={state.maxRendered}
            onChange={(v) => dispatch({ action: "SET_MINMAX", max: v })}
          />
        </EditTemplate>
      );
  }
};
