import { Item, SheetItemAction } from "type/sheet";
import { FieldString, FieldCheckbox, FieldSelect } from "./Field";

export type EditTemplateProps = {
  state: Item;
  dispatch: React.Dispatch<SheetItemAction>;
};

export const EditTemplate: React.FC<EditTemplateProps> = ({
  state: { key, sortKey, group, value, name, onclickEnabled, onclick, readOnly, type },
  dispatch,
  children,
}: React.PropsWithChildren<EditTemplateProps>) => {
  return (
    <div>
      <FieldString
        name="Group"
        value={group}
        onChange={(v) => dispatch({ action: "SET_GROUP", group: v })}
      />
      <FieldString
        name="Key"
        value={key}
        onChange={(v) => dispatch({ action: "SET_KEY", key: v })}
      />
      <FieldString
        name="Sort Key"
        value={sortKey}
        onChange={(v) => dispatch({ action: "SET_SORTKEY", sortKey: v })}
      />
      <FieldString
        name="Name"
        value={name}
        onChange={(v) => dispatch({ action: "SET_NAME", name: v })}
      />
      <FieldSelect
        name="Type"
        value={type}
        options={["omni", "boolean", "range"]}
        onChange={(v) => dispatch({ action: "SET_TYPE", type: v })}
      />
      <FieldCheckbox
        name="Readonly"
        value={readOnly}
        onChange={(v) => dispatch({ action: "SET_READONLY", readOnly: v })}
      />
      <FieldString
        name="Value"
        value={value}
        onChange={(v) => dispatch({ action: "SET_VALUE", value: v })}
      />
      <FieldCheckbox
        name="Click Enabled"
        value={onclickEnabled}
        onChange={(v) => dispatch({ action: "SET_ONCLICK_ENABLED", enabled: v })}
      />
      <FieldString
        name="Click"
        value={onclick}
        onChange={(v) => dispatch({ action: "SET_ONCLICK", value: v })}
      />

      {children}

      <button onClick={() => dispatch({ action: "COPY_ITEM" })}>Copy</button>
      <button onClick={() => dispatch({ action: "REMOVE_ITEM" })}>Remove</button>
    </div>
  );
};
