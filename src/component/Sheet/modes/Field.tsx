export type FieldProps<T> = {
  name: string;
  value: T;
  onChange: (v: T) => void;
};

export type FieldStringProps = FieldProps<string>;

export const FieldString: React.FC<FieldStringProps> = ({
  name,
  value,
  onChange,
}: FieldStringProps) => (
  <label>
    {name}:{" "}
    <input type="text" value={value} onChange={(ev) => onChange(ev.target.value)} />
  </label>
);

export type FieldCheckboxProps = FieldProps<boolean>;

export const FieldCheckbox: React.FC<FieldCheckboxProps> = ({
  name,
  value,
  onChange,
}: FieldCheckboxProps) => (
  <label>
    {name}:{" "}
    <input
      type="checkbox"
      checked={value}
      onChange={(ev) => onChange(ev.target.checked)}
    />
  </label>
);

export type FieldSelectProps = FieldProps<string> & { options: string[] };

export const FieldSelect: React.FC<FieldSelectProps> = ({
  name,
  value,
  options,
  onChange,
}: FieldSelectProps) => (
  <label>
    {name}:{" "}
    <select value={value} onChange={(ev) => onChange(ev.target.value)}>
      {options.map((v) => (
        <option key={v}>{v}</option>
      ))}
    </select>
  </label>
);
