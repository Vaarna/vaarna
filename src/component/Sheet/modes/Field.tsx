import classNames from "classnames";
import { uniqueId } from "lodash";
import { PropsWithChildren, useState } from "react";
import styles from "./Field.module.css";

export type FieldsProps = PropsWithChildren<{
  className?: string;
}>;

export const Fields: React.FC<FieldsProps> = ({ className, children }: FieldsProps) => (
  <div className={classNames([styles.fields, className])}>{children}</div>
);

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
}: FieldStringProps) => {
  const [id] = useState(uniqueId("FieldString"));

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {name}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
      />
    </div>
  );
};

export type FieldCheckboxProps = FieldProps<boolean>;

export const FieldCheckbox: React.FC<FieldCheckboxProps> = ({
  name,
  value,
  onChange,
}: FieldCheckboxProps) => {
  const [id] = useState(uniqueId("FieldCheckbox"));

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {name}
      </label>
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(ev) => onChange(ev.target.checked)}
      />
    </div>
  );
};

export type FieldSelectProps = FieldProps<string> & { options: string[] };

export const FieldSelect: React.FC<FieldSelectProps> = ({
  name,
  value,
  options,
  onChange,
}: FieldSelectProps) => {
  const [id] = useState(uniqueId("FieldSelect"));

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {name}
      </label>
      <select id={id} value={value} onChange={(ev) => onChange(ev.target.value)}>
        {options.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </div>
  );
};
