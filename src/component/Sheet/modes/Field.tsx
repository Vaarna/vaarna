import { uniqueId } from "lodash";
import { useState } from "react";
import styled from "styled-components";

const Field = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.2rem;
`;

const Label = styled.label`
  font-size: small;
`;

export const Fields = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
`;

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
    <Field>
      <Label htmlFor={id}>{name}</Label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
      />
    </Field>
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
    <Field>
      <Label htmlFor={id}>{name}</Label>
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(ev) => onChange(ev.target.checked)}
      />
    </Field>
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
    <Field>
      <Label htmlFor={id}>{name}</Label>
      <select id={id} value={value} onChange={(ev) => onChange(ev.target.value)}>
        {options.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </Field>
  );
};
