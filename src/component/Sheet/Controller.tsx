import { Item, ItemEvaluated, SheetItemAction } from "type/sheet";
import { Mode } from "./common";
import { ControllerOmni } from "./ControllerOmni";
import { ControllerCheckbox } from "./ControllerCheckbox";
import { ControllerRange } from "./ControllerRange";

export type ControllerProps = {
  mode: Mode;
  state: ItemEvaluated<Item>;
  groups: string[];
  dispatch: React.Dispatch<SheetItemAction>;
};

export const Controller: React.FC<ControllerProps> = ({
  mode,
  state,
  groups,
  dispatch,
}: ControllerProps) => {
  switch (state.type) {
    case "omni":
      return (
        <ControllerOmni mode={mode} state={state} groups={groups} dispatch={dispatch} />
      );

    case "boolean":
      return (
        <ControllerCheckbox
          mode={mode}
          state={state}
          groups={groups}
          dispatch={dispatch}
        />
      );

    case "range":
      return (
        <ControllerRange
          mode={mode}
          state={state}
          groups={groups}
          dispatch={dispatch}
        />
      );
  }
};
