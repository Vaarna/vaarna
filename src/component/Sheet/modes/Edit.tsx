import { Item } from "type/sheet";
import { PropsWithExactlyTwoChildren } from "util/react";

export type EditProps = PropsWithExactlyTwoChildren<{
  state: Pick<Item, "name" | "readOnly">;
}>;

export const Edit: React.FC<EditProps> = ({
  state: { name, readOnly },
  children,
}: EditProps) => (
  <label>
    {name}: {readOnly ? children[0] : children[1]}
  </label>
);
