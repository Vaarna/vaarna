import styles from "./Group.module.css";
import {
  SheetGroupedItems,
  SheetAction,
  SheetGroupAction,
  SheetItemAction,
  SortByUnion,
  SortOrderUnion,
  DisplayUnion,
} from "type/sheet";
import classNames from "classnames";
import { Controller } from "./Controller";
import { Mode } from "./common";
import { Fields, FieldSelect, FieldString } from "./modes/Field";
import { callIfParsed, unionMembers } from "util/zod";

export type GroupProps = {
  mode: Mode;
  group: SheetGroupedItems;
  groups: string[];
  dispatch: React.Dispatch<SheetAction>;
  groupDispatch: React.Dispatch<SheetGroupAction>;
};

export const Group: React.FC<GroupProps> = ({
  mode,
  group: { id, items, key, name, sortKey, sortBy, sortOrder, display },
  groups,
  dispatch,
  groupDispatch,
}: GroupProps) => {
  let GroupHeader: React.ReactNode = null;
  switch (mode) {
    case "display":
    case "edit":
      GroupHeader =
        name === "" ? null : (
          <div className={styles.name}>
            <span>{name}</span>
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
            value={name ?? ""}
            onChange={(name) => groupDispatch({ action: "GROUP.SET_NAME", name })}
          />
          <FieldString
            name="Sort Key"
            value={sortKey ?? ""}
            onChange={(sortKey) =>
              groupDispatch({ action: "GROUP.SET_SORTKEY", sortKey })
            }
          />
          <FieldSelect
            name="Sort By"
            value={sortBy?.[0] ?? ""}
            options={unionMembers(SortByUnion)}
            onChange={callIfParsed(SortByUnion, (sortBy) =>
              groupDispatch({ action: "GROUP.SET_SORTBY", sortBy: [sortBy] })
            )}
          />
          <FieldSelect
            name="Sort Order"
            value={sortOrder ?? ""}
            options={unionMembers(SortOrderUnion)}
            onChange={callIfParsed(SortOrderUnion, (sortOrder) =>
              groupDispatch({ action: "GROUP.SET_SORTORDER", sortOrder })
            )}
          />
          <FieldSelect
            name="Display"
            value={display ?? ""}
            options={unionMembers(DisplayUnion)}
            onChange={callIfParsed(DisplayUnion, (display) =>
              groupDispatch({ action: "GROUP.SET_DISPLAY", display })
            )}
          />
        </Fields>
      );
  }

  return (
    <div className={styles.container}>
      {id === "" ? null : <div className={styles.title}>{GroupHeader}</div>}
      <div
        className={classNames({
          [styles.items]: true,
          [styles.configRows]: display === "rows",
          [styles.configColumns]: display === "columns",
        })}
      >
        {items.map((item) => (
          <Controller
            key={item.id}
            mode={mode}
            groups={groups}
            state={item}
            dispatch={(v: SheetItemAction) => dispatch({ ...v, id: item.id })}
          />
        ))}
      </div>
    </div>
  );
};
