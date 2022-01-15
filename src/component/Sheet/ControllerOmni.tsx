import { ItemOmni, SheetItemAction } from "type/sheet";
import { Mode } from "./common";
import { Display, Edit, EditTemplate } from "./modes";

export type ControllerOmniProps = {
  mode: Mode;
  state: ItemOmni & { valueEvaluated: string };
  dispatch: React.Dispatch<SheetItemAction>;
};

export const ControllerOmni: React.FC<ControllerOmniProps> = ({
  mode,
  state,
  dispatch,
}: ControllerOmniProps) => {
  switch (mode) {
    case "display":
      return (
        <Display state={state} dispatch={dispatch}>
          {state.valueEvaluated}
        </Display>
      );

    case "edit":
      return (
        <Edit state={state}>
          <span>{state.valueEvaluated}</span>
          <input
            value={state.value}
            onChange={(ev) => dispatch({ action: "SET_VALUE", value: ev.target.value })}
          />
        </Edit>
      );

    case "edit_template":
      return <EditTemplate state={state} dispatch={dispatch} />;
  }
};
