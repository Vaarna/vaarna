import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { groupItems, SheetGroupedItems, SheetState } from "@vaarna/sheet-logic";
import {
  createGroup,
  createItem,
  selectCreateGroupInProgress,
  selectCreateItemInProgress,
  selectSpaceId,
  updateGroup,
  useAppDispatch,
  useAppSelector,
} from "@vaarna/state";
import { callIfParsed, GroupSortOrder, unionMembers } from "@vaarna/type";

import { CollapsibleGroup } from "../CollapsibleGroup";
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

const Group: React.FC<GroupProps> = ({ groups, state }) => {
  const dispatch = useAppDispatch();

  const { items, ...group } = state;

  const [groupState, setGroup] = useState(group);
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(updateGroup(groupState));
    }, 1000);

    return () => clearTimeout(t);
  }, [dispatch, groupState]);

  return (
    <CollapsibleGroup>
      <Fields>
        <FieldString
          name="Group Name"
          value={groupState.name ?? ""}
          onChange={(name) => setGroup((group) => ({ ...group, name }))}
        />
        <FieldString
          name="Group Key"
          value={groupState.key}
          onChange={(key) => setGroup((group) => ({ ...group, key }))}
        />
        <FieldString
          name="Group Sort Key"
          value={groupState.sortKey ?? ""}
          onChange={(sortKey) => setGroup((group) => ({ ...group, sortKey }))}
        />
        <FieldSelect
          name="Sort Order"
          value={groupState.sortOrder ?? "desc"}
          options={unionMembers(GroupSortOrder)}
          onChange={callIfParsed(GroupSortOrder, (sortOrder) =>
            setGroup((group) => ({ ...group, sortOrder }))
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

  const createGroupInProgress = useAppSelector(selectCreateGroupInProgress);
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
            disabled={createGroupInProgress}
            onClick={() =>
              dispatch(createGroup({ spaceId, sheetId: state.sheetId, key: "" }))
            }
          >
            New Group
          </button>
        </>
      )}
    </Container>
  );
};
