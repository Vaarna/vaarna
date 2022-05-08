import { Item } from "type/sheet";
import { ItemEvaluated } from "util/evalItems";
import { Mode } from "./common";
import { ControllerOmni } from "./ControllerOmni";
import { ControllerCheckbox } from "./ControllerCheckbox";
import { ControllerRange } from "./ControllerRange";

export type ControllerProps = {
  mode: Mode;
  state: ItemEvaluated<Item>;
  groups: string[];
};

export const Controller: React.FC<ControllerProps> = ({
  mode,
  state,
  groups,
}: ControllerProps) => {
  switch (state.type) {
    case "omni":
      return <ControllerOmni mode={mode} state={state} groups={groups} />;

    case "boolean":
      return <ControllerCheckbox mode={mode} state={state} groups={groups} />;

    case "range":
      return <ControllerRange mode={mode} state={state} groups={groups} />;
  }
};
