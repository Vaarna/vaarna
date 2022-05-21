import { CollapsibleGroup } from "component/CollapsibleGroup";
import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "state/hook";
import {
  createItem,
  newGroup,
  selectCreateItemInProgress,
  selectSpaceId,
  setGroupParameters,
} from "state/slice";
import styled from "styled-components";
import { GroupSortOrder } from "type/space";
import { groupItems, SheetGroupedItems, SheetState } from "util/evalItems";
import { callIfParsed, unionMembers } from "util/zod";
import { EditTemplate } from "./modes";
import { Fields, FieldSelect, FieldString } from "./modes/Field";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const ItemsContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
`;

type ItemsProps = {
  groups: string[];
  state: SheetGroupedItems["items"];
};

const Items: React.FC<ItemsProps> = ({ groups, state }) => {
  return (
    <ItemsContainer>
      {state.map((item) => (
        <EditTemplate key={item.itemId} groups={groups} state={item} />
      ))}
    </ItemsContainer>
  );
};

type GroupProps = {
  groups: string[];
  state: SheetGroupedItems;
};

const Group: React.FC<GroupProps> = ({
  groups,
  state: { groupId, name, key, sortKey, sortOrder, items },
}) => {
  const dispatch = useAppDispatch();

  return (
    <CollapsibleGroup>
      <Fields>
        <FieldString
          name="Group Name"
          value={name ?? ""}
          onChange={(name) => dispatch(setGroupParameters({ groupId, name }))}
        />
        <FieldString
          name="Group Key"
          value={key}
          onChange={(key) => dispatch(setGroupParameters({ groupId, key }))}
        />
        <FieldString
          name="Group Sort Key"
          value={sortKey ?? ""}
          onChange={(sortKey) => dispatch(setGroupParameters({ groupId, sortKey }))}
        />
        <FieldSelect
          name="Sort Order"
          value={sortOrder ?? "desc"}
          options={unionMembers(GroupSortOrder)}
          onChange={callIfParsed(GroupSortOrder, (sortOrder) =>
            dispatch(setGroupParameters({ groupId, sortOrder }))
          )}
        />
      </Fields>

      <Items groups={groups} state={items} />
    </CollapsibleGroup>
  );
};

export type SheetEditTemplateProps = {
  state: SheetState;
};

export const SheetEditTemplate: React.FC<SheetEditTemplateProps> = ({ state }) => {
  const dispatch = useAppDispatch();

  const spaceId = useAppSelector(selectSpaceId);

  const groups = useMemo(() => groupItems(state), [state]);
  const groupKeys = [...new Set(["", ...state.groups.map((group) => group.key)])];

  const createItemInProgress = useAppSelector(selectCreateItemInProgress);

  return (
    <Container>
      {groups.map((group) =>
        group.groupId === "" ? (
          <Items key="" groups={groupKeys} state={group.items} />
        ) : (
          <Group key={group.groupId} groups={groupKeys} state={group} />
        )
      )}

      {spaceId !== null && (
        <>
          <button
            disabled={createItemInProgress}
            onClick={() =>
              dispatch(
                createItem({
                  spaceId,
                  sheetId: state.sheetId,
                  name: "",
                  type: "omni",
                  group: "",
                  key: "",
                  onclick: "",
                  onclickEnabled: false,
                  readOnly: false,
                  sortKey: "",
                  value: "",
                })
              )
            }
          >
            New Item
          </button>
          <button
            onClick={() =>
              dispatch(newGroup({ spaceId, sheetId: state.sheetId, key: "" }))
            }
          >
            New Group
          </button>
        </>
      )}
    </Container>
  );
};
