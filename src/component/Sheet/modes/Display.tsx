import styles from "./Display.module.css";
import { Item, SheetItemAction } from "type/sheet";
import classNames from "classnames";

export type DisplayProps = React.PropsWithChildren<{
  state: Item;
  dispatch: React.Dispatch<SheetItemAction>;
}>;

export const Display: React.FC<DisplayProps> = ({
  state: { name, onclickEnabled },
  dispatch,
  children,
}: DisplayProps) => (
  <div
    className={classNames({
      [styles.container]: true,
      [styles.clickable]: onclickEnabled,
    })}
    onClick={
      onclickEnabled
        ? () => dispatch({ action: "CLICK" })
        : () => {
            return;
          }
    }
  >
    <div className={styles.name}>
      <span className={classNames({ [styles.clickableText]: onclickEnabled })}>
        {name}
      </span>
    </div>
    <div className={styles.value}>{children}</div>
  </div>
);
