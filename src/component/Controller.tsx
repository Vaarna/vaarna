import { Item, ItemOmni, ItemBoolean, SheetItemAction, ItemRange } from "type/sheet";

type PropsWithExactlyTwoChildren<T> = T & {
  children: [React.ReactNode, React.ReactNode];
};

export type Mode = "display" | "edit" | "edit_template";

type DisplayProps = {
  state: Item;
  dispatch: React.Dispatch<SheetItemAction>;
};

const Display = ({
  state: { name, onclickEnabled },
  dispatch,
  children,
}: React.PropsWithChildren<DisplayProps>) => (
  <button disabled={!onclickEnabled} onClick={() => dispatch({ action: "CLICK" })}>
    <label>
      {name}: {children}
    </label>
  </button>
);

type EditProps = {
  state: Item;
  // dispatch: React.Dispatch<SheetItemAction>;
};

const Edit = ({ state, children }: PropsWithExactlyTwoChildren<EditProps>) => (
  <label>
    {state.name}: {state.readOnly ? children[0] : children[1]}
  </label>
);

type FieldProps<T> = {
  name: string;
  value: T;
  onChange: (v: T) => void;
};

const StringField = ({ name, value, onChange }: FieldProps<string>) => (
  <label>
    {name}:{" "}
    <input type="text" value={value} onChange={(ev) => onChange(ev.target.value)} />
  </label>
);

const CheckboxField = ({ name, value, onChange }: FieldProps<boolean>) => (
  <label>
    {name}:{" "}
    <input
      type="checkbox"
      checked={value}
      onChange={(ev) => onChange(ev.target.checked)}
    />
  </label>
);

const SelectField = ({
  name,
  value,
  options,
  onChange,
}: FieldProps<string> & { options: string[] }) => (
  <label>
    {name}:{" "}
    <select value={value} onChange={(ev) => onChange(ev.target.value)}>
      {options.map((v) => (
        <option key={v}>{v}</option>
      ))}
    </select>
  </label>
);

type EditTemplateProps = {
  state: Item;
  dispatch: React.Dispatch<SheetItemAction>;
};

const EditTemplate: React.FC<EditTemplateProps> = ({
  state: { key, group, value, name, onclickEnabled, onclick, readOnly, type },
  dispatch,
  children,
}: React.PropsWithChildren<EditTemplateProps>) => {
  return (
    <div>
      <StringField
        name="Group"
        value={group}
        onChange={(v) => dispatch({ action: "SET_GROUP", group: v })}
      />
      <StringField
        name="Key"
        value={key}
        onChange={(v) => dispatch({ action: "SET_KEY", key: v })}
      />
      <StringField
        name="Name"
        value={name}
        onChange={(v) => dispatch({ action: "SET_NAME", name: v })}
      />
      <SelectField
        name="Type"
        value={type}
        options={["omni", "boolean", "range"]}
        onChange={(v) => dispatch({ action: "SET_TYPE", type: v })}
      />
      <CheckboxField
        name="Readonly"
        value={readOnly}
        onChange={(v) => dispatch({ action: "SET_READONLY", readOnly: v })}
      />
      <StringField
        name="Value"
        value={value}
        onChange={(v) => dispatch({ action: "SET_VALUE", value: v })}
      />
      <CheckboxField
        name="Click Enabled"
        value={onclickEnabled}
        onChange={(v) => dispatch({ action: "SET_ONCLICK_ENABLED", enabled: v })}
      />
      <StringField
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

type ControllerRangeProps = {
  mode: Mode;
  state: ItemRange & {
    valueRendered: string;
    minRendered: string;
    maxRendered: string;
  };
  dispatch: React.Dispatch<SheetItemAction>;
};

const ControllerRange: React.FC<ControllerRangeProps> = ({
  mode,
  state,
  dispatch,
}: ControllerRangeProps) => {
  switch (mode) {
    case "display":
      return (
        <Display state={state} dispatch={dispatch}>
          <input value={`${state.valueRendered}/${state.maxRendered}`} disabled />
        </Display>
      );

    case "edit":
      return (
        <Edit state={state}>
          <>
            <input
              type="number"
              disabled
              min={state.minRendered}
              max={state.maxRendered}
              value={state.valueRendered}
            />
            <span>/ {state.maxRendered}</span>
          </>
          <>
            <input
              type="number"
              min={state.minRendered}
              max={state.maxRendered}
              value={state.valueRendered}
              onChange={(ev) =>
                dispatch({ action: "SET_VALUE", value: ev.target.value })
              }
            />
            <span>/ {state.maxRendered}</span>
          </>
        </Edit>
      );

    case "edit_template":
      return (
        <EditTemplate state={state} dispatch={dispatch}>
          <StringField
            name="Min"
            value={state.minRendered}
            onChange={(v) => dispatch({ action: "SET_MINMAX", min: v })}
          />
          <StringField
            name="Max"
            value={state.maxRendered}
            onChange={(v) => dispatch({ action: "SET_MINMAX", max: v })}
          />
        </EditTemplate>
      );
  }
};

type ControllerCheckboxProps = {
  mode: Mode;
  state: ItemBoolean & { valueRendered: string };
  dispatch: React.Dispatch<SheetItemAction>;
};

const ControllerCheckbox: React.FC<ControllerCheckboxProps> = ({
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

type ControllerOmniProps = {
  mode: Mode;
  state: ItemOmni & { valueRendered: string };
  dispatch: React.Dispatch<SheetItemAction>;
};

const ControllerOmni: React.FC<ControllerOmniProps> = ({
  mode,
  state,
  dispatch,
}: ControllerOmniProps) => {
  switch (mode) {
    case "display":
      return (
        <Display state={state} dispatch={dispatch}>
          {state.valueRendered}
        </Display>
      );

    case "edit":
      return (
        <Edit state={state}>
          <span>{state.valueRendered}</span>
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

type ControllerProps = {
  mode: Mode;
  state: Item & { valueRendered: string; minRendered: string; maxRendered: string };
  dispatch: React.Dispatch<SheetItemAction>;
};

export const Controller: React.FC<ControllerProps> = ({
  mode,
  state,
  dispatch,
}: ControllerProps) => {
  switch (state.type) {
    case "omni":
      return <ControllerOmni mode={mode} state={state} dispatch={dispatch} />;

    case "boolean":
      return <ControllerCheckbox mode={mode} state={state} dispatch={dispatch} />;

    case "range":
      return <ControllerRange mode={mode} state={state} dispatch={dispatch} />;
  }
};
