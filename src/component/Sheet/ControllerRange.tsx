import { useAppDispatch } from "hooks";
import { setItemMinMax, setItemParameters } from "reducer";
import { ItemRange } from "type/sheet";
import { ItemEvaluated } from "util/evalItems";
import { Mode } from "./common";
import { Display, Edit, EditTemplate } from "./modes";
import { FieldString } from "./modes/Field";

export type ControllerRangeProps = {
  mode: Mode;
  state: ItemEvaluated<ItemRange>;
  groups: string[];
};

export const ControllerRange: React.FC<ControllerRangeProps> = ({
  mode,
  state,
  groups,
}: ControllerRangeProps) => {
  const dispatch = useAppDispatch();
  const { itemId } = state;

  const leftPadStyle = { paddingLeft: "0.5rem" };
  switch (mode) {
    case "display":
      return (
        <Display state={state}>
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
                dispatch(setItemParameters({ itemId, value: ev.target.value }))
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
        <EditTemplate state={state} groups={groups}>
          <FieldString
            name="Min"
            value={state.min ?? ""}
            onChange={(v) => dispatch(setItemMinMax({ itemId, min: v }))}
          />
          <FieldString
            name="Max"
            value={state.max ?? ""}
            onChange={(v) => dispatch(setItemMinMax({ itemId, max: v }))}
          />
        </EditTemplate>
      );
  }
};
