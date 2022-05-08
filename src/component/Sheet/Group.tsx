import styles from "./Group.module.css";
import { setGroupParameters } from "reducer";
import { GroupDisplay, GroupSortBy, GroupSortOrder } from "type/sheet";
import { SheetGroupedItems } from "util/evalItems";
import classNames from "classnames";
import { Controller } from "./Controller";
import { Mode } from "./common";
import { Fields, FieldSelect, FieldString } from "./modes/Field";
import { callIfParsed, unionMembers } from "util/zod";
import { useAppDispatch } from "hooks";

export type GroupProps = {
  mode: Mode;
  group: SheetGroupedItems;
  groups: string[];
};

export const Group: React.FC<GroupProps> = ({
  mode,
  group: { groupId, items, key, name, sortKey, sortBy, sortOrder, display },
  groups,
}: GroupProps) => {
  const dispatch = useAppDispatch();

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
            onChange={(name) => dispatch(setGroupParameters({ groupId, name }))}
          />
          <FieldString
            name="Sort Key"
            value={sortKey ?? ""}
            onChange={(sortKey) => dispatch(setGroupParameters({ groupId, sortKey }))}
          />
          <FieldSelect
            name="Sort By"
            value={sortBy?.[0] ?? ""}
            options={unionMembers(GroupSortBy)}
            onChange={callIfParsed(GroupSortBy, (sortBy) =>
              dispatch(setGroupParameters({ groupId, sortBy: [sortBy] }))
            )}
          />
          <FieldSelect
            name="Sort Order"
            value={sortOrder ?? ""}
            options={unionMembers(GroupSortOrder)}
            onChange={callIfParsed(GroupSortOrder, (sortOrder) =>
              dispatch(setGroupParameters({ groupId, sortOrder }))
            )}
          />
          <FieldSelect
            name="Display"
            value={display ?? ""}
            options={unionMembers(GroupDisplay)}
            onChange={callIfParsed(GroupDisplay, (display) =>
              dispatch(setGroupParameters({ groupId, display }))
            )}
          />
        </Fields>
      );
  }

  return (
    <div className={styles.container}>
      {groupId === "" ? null : <div className={styles.title}>{GroupHeader}</div>}
      <div
        className={classNames({
          [styles.items]: true,
          [styles.configRows]: display === "rows",
          [styles.configColumns]: display === "columns",
        })}
      >
        {items.map((item) => (
          <Controller key={item.itemId} mode={mode} groups={groups} state={item} />
        ))}
      </div>
    </div>
  );
};
