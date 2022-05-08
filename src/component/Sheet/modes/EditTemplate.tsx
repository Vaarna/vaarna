import { useAppDispatch } from "hooks";
import { copyItem, removeItem, setItemParameters, setItemType } from "reducer";
import { Item, ItemType } from "type/sheet";
import { callIfParsed, unionMembers } from "util/zod";
import { Fields, FieldString, FieldCheckbox, FieldSelect } from "./Field";

export type EditTemplateProps = {
  state: Item;
  groups: string[];
};

export const EditTemplate: React.FC<EditTemplateProps> = ({
  state: {
    itemId,
    key,
    sortKey,
    group,
    value,
    name,
    onclickEnabled,
    onclick,
    readOnly,
    type,
  },
  groups,
  children,
}: React.PropsWithChildren<EditTemplateProps>) => {
  const dispatch = useAppDispatch();

  return (
    <Fields>
      <FieldSelect
        name="Group"
        value={group}
        options={groups}
        onChange={(v) => dispatch(setItemParameters({ itemId, group: v }))}
      />
      <FieldString
        name="Key"
        value={key}
        onChange={(v) => dispatch(setItemParameters({ itemId, key: v }))}
      />
      <FieldString
        name="Sort Key"
        value={sortKey}
        onChange={(v) => dispatch(setItemParameters({ itemId, sortKey: v }))}
      />
      <FieldString
        name="Name"
        value={name}
        onChange={(v) => dispatch(setItemParameters({ itemId, name: v }))}
      />
      <FieldSelect
        name="Type"
        value={type}
        options={unionMembers(ItemType)}
        onChange={callIfParsed(ItemType, (type) =>
          dispatch(setItemType({ itemId, type }))
        )}
      />
      <FieldCheckbox
        name="Readonly"
        value={readOnly}
        onChange={(v) => dispatch(setItemParameters({ itemId, readOnly: v }))}
      />
      <FieldString
        name="Value"
        value={value}
        onChange={(v) => dispatch(setItemParameters({ itemId, value: v }))}
      />
      <FieldCheckbox
        name="Click Enabled"
        value={onclickEnabled}
        onChange={(v) => dispatch(setItemParameters({ itemId, onclickEnabled: v }))}
      />
      <FieldString
        name="Click"
        value={onclick}
        onChange={(v) => dispatch(setItemParameters({ itemId, onclick: v }))}
      />

      {children}

      <button onClick={() => dispatch(copyItem(itemId))}>Copy</button>
      <button onClick={() => dispatch(removeItem(itemId))}>Remove</button>
    </Fields>
  );
};
