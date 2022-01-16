import { ItemBoolean, SheetItemAction } from "type/sheet";
import { Mode } from "./common";
import { Display, Edit, EditTemplate } from "./modes";

export type ControllerCheckboxProps = {
  mode: Mode;
  state: ItemBoolean & { valueEvaluated: string };
  dispatch: React.Dispatch<SheetItemAction>;
};

export const ControllerCheckbox: React.FC<ControllerCheckboxProps> = ({
  mode,
  state,
  dispatch,
}: ControllerCheckboxProps) => {
  const valueEvaluatedBool = parseFloat(state.valueEvaluated) !== 0;

  switch (mode) {
    case "display":
      return (
        <Display state={state} dispatch={dispatch}>
          <input type="checkbox" checked={valueEvaluatedBool} disabled />
        </Display>
      );

    case "edit":
      return (
        <Edit state={state}>
          <input type="checkbox" disabled={true} checked={valueEvaluatedBool} />
          <input
            type="checkbox"
            checked={valueEvaluatedBool}
            onChange={(ev) =>
              dispatch({
                action: "ITEM.SET_VALUE",
                value: ev.target.checked ? "1" : "0",
              })
            }
          />
        </Edit>
      );

    case "edit_template":
      return <EditTemplate state={state} dispatch={dispatch} />;
  }
};
