import styles from "./Display.module.css";
import { Item } from "type/space";
import { PropsWithExactlyTwoChildren } from "util/react";

export type EditProps = PropsWithExactlyTwoChildren<{
  state: Pick<Item, "name" | "readOnly">;
}>;

export const Edit: React.FC<EditProps> = ({
  state: { name, readOnly },
  children,
}: EditProps) => (
  <div className={styles.container}>
    <div className={styles.name}>
      <span>{name}</span>
    </div>
    <div className={styles.value}>{readOnly ? children[0] : children[1]}</div>
  </div>
);
