import { useAppDispatch } from "state/hook";
import { setItemParameters } from "state/slice";
import { ItemOmni } from "type/space";
import { ItemEvaluated } from "util/evalItems";
import { Mode } from "./common";
import { Display, Edit, EditTemplate } from "./modes";

export type ControllerOmniProps = {
  mode: Mode;
  state: ItemEvaluated<ItemOmni>;
  groups: string[];
};

export const ControllerOmni: React.FC<ControllerOmniProps> = ({
  mode,
  state,
  groups,
}) => {
  const dispatch = useAppDispatch();
  const { itemId } = state;

  switch (mode) {
    case "display":
      return <Display state={state}>{state.valueEvaluated}</Display>;

    case "edit":
      return (
        <Edit state={state}>
          <span>{state.valueEvaluated}</span>
          <input
            value={state.value}
            onChange={(ev) =>
              dispatch(setItemParameters({ itemId, value: ev.target.value }))
            }
          />
        </Edit>
      );

    case "edit_template":
      return <EditTemplate state={state} groups={groups} />;
  }
};
