import { Item, ItemTypeUnion, SheetItemAction } from "type/sheet";
import { callIfParsed, unionMembers } from "util/zod";
import { Fields, FieldString, FieldCheckbox, FieldSelect } from "./Field";

export type EditTemplateProps = {
  state: Item;
  groups: string[];
  dispatch: React.Dispatch<SheetItemAction>;
};

export const EditTemplate: React.FC<EditTemplateProps> = ({
  state: { key, sortKey, group, value, name, onclickEnabled, onclick, readOnly, type },
  groups,
  dispatch,
  children,
}: React.PropsWithChildren<EditTemplateProps>) => {
  return (
    <Fields>
      <FieldSelect
        name="Group"
        value={group}
        options={groups}
        onChange={(v) => dispatch({ action: "ITEM.SET_GROUP", group: v })}
      />
      <FieldString
        name="Key"
        value={key}
        onChange={(v) => dispatch({ action: "ITEM.SET_KEY", key: v })}
      />
      <FieldString
        name="Sort Key"
        value={sortKey}
        onChange={(v) => dispatch({ action: "ITEM.SET_SORTKEY", sortKey: v })}
      />
      <FieldString
        name="Name"
        value={name}
        onChange={(v) => dispatch({ action: "ITEM.SET_NAME", name: v })}
      />
      <FieldSelect
        name="Type"
        value={type}
        options={unionMembers(ItemTypeUnion)}
        onChange={callIfParsed(ItemTypeUnion, (type) =>
          dispatch({ action: "ITEM.SET_TYPE", type })
        )}
      />
      <FieldCheckbox
        name="Readonly"
        value={readOnly}
        onChange={(v) => dispatch({ action: "ITEM.SET_READONLY", readOnly: v })}
      />
      <FieldString
        name="Value"
        value={value}
        onChange={(v) => dispatch({ action: "ITEM.SET_VALUE", value: v })}
      />
      <FieldCheckbox
        name="Click Enabled"
        value={onclickEnabled}
        onChange={(v) =>
          dispatch({ action: "ITEM.SET_ONCLICK_ENABLED", onclickEnabled: v })
        }
      />
      <FieldString
        name="Click"
        value={onclick}
        onChange={(v) => dispatch({ action: "ITEM.SET_ONCLICK", onclick: v })}
      />

      {children}

      <button onClick={() => dispatch({ action: "ITEM.COPY" })}>Copy</button>
      <button onClick={() => dispatch({ action: "ITEM.REMOVE" })}>Remove</button>
    </Fields>
  );
};
