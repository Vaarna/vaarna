import { setGroupParameters } from "state/slice";
import { GroupDisplay, GroupSortBy, GroupSortOrder } from "type/space";
import { SheetGroupedItems } from "util/evalItems";
import { Controller } from "./Controller";
import { Mode } from "./common";
import { Fields, FieldSelect, FieldString } from "./modes/Field";
import { callIfParsed, unionMembers } from "util/zod";
import { useAppDispatch } from "state/hook";
import styled, { css } from "styled-components";

type NamedGroup = { namedGroup: boolean };

const Container = styled.div<NamedGroup>`
  display: flex;
  flex-direction: column;

  ${(props) =>
    props.namedGroup &&
    css`
      border: 1px solid black;
      border-radius: ${({ theme }) => theme.borderRadius};
    `}
`;

const Title = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-bottom: 1px solid black;
`;

const Items = styled.div`
  padding: 0.5rem;
`;

type Display = { display?: GroupDisplay };

const GroupContent = styled.div<Display>`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;

  ${(props) =>
    props.display === "columns"
      ? css`
          flex-direction: row;
        `
      : css`
          flex-direction: column;
        `}
`;

export type GroupProps = {
  mode: Mode;
  group: SheetGroupedItems;
  groups: string[];
};

export const Group: React.FC<GroupProps> = ({
  mode,
  group: { groupId, items, key, name, sortKey, sortBy, sortOrder, display },
  groups,
}) => {
  const dispatch = useAppDispatch();

  let GroupHeader: React.ReactNode = null;
  switch (mode) {
    case "display":
    case "edit":
      GroupHeader =
        name === "" ? null : (
          <div>
            <span>{name}</span>
          </div>
        );
      break;

    case "edit_template":
      GroupHeader = (
        <Fields>
          <FieldString
            name="Group Key"
            value={key ?? ""}
            onChange={(key) => dispatch(setGroupParameters({ groupId, key }))}
          />
          <FieldString
            name="Group Name"
            value={name ?? ""}
            onChange={(name) => dispatch(setGroupParameters({ groupId, name }))}
          />
          <FieldString
            name="Group Sort Key"
            value={sortKey ?? ""}
            onChange={(sortKey) => dispatch(setGroupParameters({ groupId, sortKey }))}
          />
          <FieldSelect
            name="Group Sort By"
            value={sortBy?.[0] ?? ""}
            options={unionMembers(GroupSortBy)}
            onChange={callIfParsed(GroupSortBy, (sortBy) =>
              dispatch(setGroupParameters({ groupId, sortBy: [sortBy] }))
            )}
          />
          <FieldSelect
            name="Group Sort Order"
            value={sortOrder ?? ""}
            options={unionMembers(GroupSortOrder)}
            onChange={callIfParsed(GroupSortOrder, (sortOrder) =>
              dispatch(setGroupParameters({ groupId, sortOrder }))
            )}
          />
          <FieldSelect
            name="Group Display"
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
    <Container namedGroup={groupId !== ""}>
      {groupId === "" ? null : <Title>{GroupHeader}</Title>}
      <GroupContent display={display}>
        {items.map((item) => (
          <Items key={item.itemId}>
            <Controller mode={mode} groups={groups} state={item} />
          </Items>
        ))}
      </GroupContent>
    </Container>
  );
};
