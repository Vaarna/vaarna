import styles from "./Display.module.css";
import { Item } from "type/sheet";
import classNames from "classnames";

export type DisplayProps = React.PropsWithChildren<{
  state: Item;
}>;

export const Display: React.FC<DisplayProps> = ({
  state: { itemId, name, onclickEnabled },
  children,
}: DisplayProps) => {
  // TODO: implement click
  // const dispatch = useAppDispatch();

  return (
    <div
      className={classNames({
        [styles.container]: true,
        [styles.clickable]: onclickEnabled,
      })}
      onClick={
        onclickEnabled
          ? () => console.log("CLICK", { itemId })
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
};
