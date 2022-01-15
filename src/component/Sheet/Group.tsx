import styles from "./Group.module.css";
import {
  SheetGroupedItems,
  SheetAction,
  SheetGroupAction,
  SheetItemAction,
} from "type/sheet";
import classNames from "classnames";
import { Controller } from "./Controller";
import { Mode } from "./common";
import { Fields, FieldSelect, FieldString } from "./modes/Field";

export type GroupProps = {
  mode: Mode;
  group: SheetGroupedItems;
  dispatch: React.Dispatch<SheetAction>;
  groupDispatch: React.Dispatch<SheetGroupAction>;
};

export const Group: React.FC<GroupProps> = ({
  mode,
  group: { config, items, key },
  dispatch,
  groupDispatch,
}: GroupProps) => {
  let GroupHeader: React.ReactNode = null;
  switch (mode) {
    case "display":
    case "edit":
      GroupHeader =
        config.name === "" ? null : (
          <div className={styles.name}>
            <span>{config.name}</span>
          </div>
        );
      break;

    case "edit_template":
      GroupHeader = (
        <Fields className={styles.edit}>
          <div className={styles.name}>
            <span>{key}</span>
          </div>
          <FieldString
            name="Group Name"
            value={config.name ?? ""}
            onChange={(name) => groupDispatch({ action: "GROUP.SET_NAME", name })}
          />
          <FieldString
            name="Sort Key"
            value={config.sortKey ?? ""}
            onChange={(sortKey) =>
              groupDispatch({ action: "GROUP.SET_SORTKEY", sortKey })
            }
          />
          <FieldSelect
            name="Sort By"
            value={config.sortBy?.[0] ?? "sortKey"}
            options={["sortKey", "key", "valueEvaluated", "name"]}
            onChange={(v) => {
              let sortBy:
                | ("sortKey" | "key" | "valueEvaluated" | "name")[]
                | undefined = undefined;
              if (
                v === "sortKey" ||
                v === "key" ||
                v === "valueEvaluated" ||
                v === "name"
              )
                sortBy = [v];
              groupDispatch({
                action: "GROUP.SET_SORTBY",
                sortBy,
              });
            }}
          />
          <FieldSelect
            name="Sort Order"
            value={config.sortOrder ?? "desc"}
            options={["asc", "desc"]}
            onChange={(v) => {
              let sortOrder: "asc" | "desc" | undefined = undefined;
              if (v === "asc") sortOrder = v;
              if (v === "desc") sortOrder = v;
              groupDispatch({ action: "GROUP.SET_SORTORDER", sortOrder });
            }}
          />
          <FieldSelect
            name="Display"
            value={config.display ?? ""}
            options={["rows", "columns"]}
            onChange={(v) => {
              let display: "rows" | "columns" | undefined = undefined;
              if (v === "rows" || v === "columns") display = v;
              groupDispatch({ action: "GROUP.SET_DISPLAY", display });
            }}
          />
        </Fields>
      );
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>{GroupHeader}</div>
      <div
        className={classNames({
          [styles.items]: true,
          [styles.configRows]: config.display === "rows",
          [styles.configColumns]: config.display === "columns",
        })}
      >
        {items.map((item) => (
          <Controller
            key={item.id}
            mode={mode}
            state={item}
            dispatch={(v: SheetItemAction) => dispatch({ ...v, id: item.id })}
          />
        ))}
      </div>
    </div>
  );
};
