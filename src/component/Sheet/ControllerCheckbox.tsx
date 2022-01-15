import { ItemBoolean, SheetItemAction } from "type/sheet";
import { Mode } from "./common";
import { Display, Edit, EditTemplate } from "./modes";

export type ControllerCheckboxProps = {
  mode: Mode;
  state: ItemBoolean & { valueRendered: string };
  dispatch: React.Dispatch<SheetItemAction>;
};

export const ControllerCheckbox: React.FC<ControllerCheckboxProps> = ({
  mode,
  state,
  dispatch,
}: ControllerCheckboxProps) => {
  const valueRenderedBool = parseFloat(state.valueRendered) !== 0;

  switch (mode) {
    case "display":
      return (
        <Display state={state} dispatch={dispatch}>
          <input type="checkbox" checked={valueRenderedBool} disabled />
        </Display>
      );

    case "edit":
      return (
        <Edit state={state}>
          <input type="checkbox" disabled={true} checked={valueRenderedBool} />
          <input
            type="checkbox"
            checked={valueRenderedBool}
            onChange={(ev) =>
              dispatch({ action: "SET_VALUE", value: ev.target.checked ? "1" : "0" })
            }
          />
        </Edit>
      );

    case "edit_template":
      return <EditTemplate state={state} dispatch={dispatch} />;
  }
};
