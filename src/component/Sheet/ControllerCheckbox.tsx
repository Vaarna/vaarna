import { useAppDispatch } from "state/hook";
import { setItemParameters } from "state/slice";
import { ItemBoolean } from "type/space";
import { ItemEvaluated } from "util/evalItems";
import { Mode } from "./common";
import { Display, Edit, EditTemplate } from "./modes";

export type ControllerCheckboxProps = {
  mode: Mode;
  state: ItemEvaluated<ItemBoolean>;
  groups: string[];
};

export const ControllerCheckbox: React.FC<ControllerCheckboxProps> = ({
  mode,
  groups,
  state,
}) => {
  const dispatch = useAppDispatch();
  const { itemId } = state;

  const valueEvaluatedBool = parseFloat(state.valueEvaluated) !== 0;

  switch (mode) {
    case "display":
      return (
        <Display state={state}>
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
              dispatch(
                setItemParameters({ itemId, value: ev.target.checked ? "1" : "0" })
              )
            }
          />
        </Edit>
      );

    case "edit_template":
      return <EditTemplate state={state} groups={groups} />;
  }
};
