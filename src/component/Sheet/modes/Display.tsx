import { Item, SheetItemAction } from "type/sheet";

export type DisplayProps = React.PropsWithChildren<{
  state: Item;
  dispatch: React.Dispatch<SheetItemAction>;
}>;

export const Display: React.FC<DisplayProps> = ({
  state: { name, onclickEnabled },
  dispatch,
  children,
}: DisplayProps) => (
  <button disabled={!onclickEnabled} onClick={() => dispatch({ action: "CLICK" })}>
    <label>
      {name}: {children}
    </label>
  </button>
);
