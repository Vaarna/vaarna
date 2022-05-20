import React, { useMemo } from "react";
import { useAppDispatch } from "state/hook";
import {
  newGroup,
  newItem,
  setGroupParameters,
  setItemParameters,
  setItemType,
} from "state/slice";
import styled from "styled-components";
import { GroupSortOrder, Item, ItemType } from "type/space";
import {
  groupItems,
  ItemEvaluated,
  SheetGroupedItems,
  SheetState,
} from "util/evalItems";
import { callIfParsed, unionMembers } from "util/zod";
import { Fields, FieldSelect, FieldString, FieldCheckbox } from "./modes/Field";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const GroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 0.25rem;
  border: 1px solid black;
  box-shadow: 4px 4px 4px 0 lightgray;
`;

const GroupHeader = styled.div`
  padding: 0.5rem;
  border-radius: 0.25rem 0.25rem 0 0;
  background-color: lightgray;
`;

const GroupBody = styled.div`
  padding: 0.5rem;
`;

const ItemsContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
`;

type ItemProps = {
  groups: string[];
  state: ItemEvaluated<Item>;
};

const ItemComponent: React.FC<ItemProps> = ({
  groups,
  state: {
    itemId,
    group,
    key,
    sortKey,
    name,
    type,
    readOnly,
    value,
    onclickEnabled,
    onclick,
  },
}) => {
  const dispatch = useAppDispatch();

  return (
    <Fields>
      <FieldSelect
        name="Group"
        value={group}
        options={groups}
        onChange={(v) => dispatch(setItemParameters({ itemId, group: v }))}
      />
      <FieldString
        name="Key"
        value={key}
        onChange={(v) => dispatch(setItemParameters({ itemId, key: v }))}
      />
      <FieldString
        name="Sort Key"
        value={sortKey}
        onChange={(v) => dispatch(setItemParameters({ itemId, sortKey: v }))}
      />
      <FieldString
        name="Name"
        value={name}
        onChange={(v) => dispatch(setItemParameters({ itemId, name: v }))}
      />
      <FieldSelect
        name="Type"
        value={type}
        options={unionMembers(ItemType)}
        onChange={callIfParsed(ItemType, (type) =>
          dispatch(setItemType({ itemId, type }))
        )}
      />
      <FieldCheckbox
        name="Readonly"
        value={readOnly}
        onChange={(v) => dispatch(setItemParameters({ itemId, readOnly: v }))}
      />
      <FieldString
        name="Value"
        value={value}
        onChange={(v) => dispatch(setItemParameters({ itemId, value: v }))}
      />
      <FieldCheckbox
        name="Click Enabled"
        value={onclickEnabled}
        onChange={(v) => dispatch(setItemParameters({ itemId, onclickEnabled: v }))}
      />
      <FieldString
        name="Click"
        value={onclick}
        onChange={(v) => dispatch(setItemParameters({ itemId, onclick: v }))}
      />
    </Fields>
  );
};

type ItemsProps = {
  groups: string[];
  state: SheetGroupedItems["items"];
};

const Items: React.FC<ItemsProps> = ({ groups, state }) => {
  return (
    <ItemsContainer>
      {state.map((item) => (
        <ItemComponent key={item.itemId} groups={groups} state={item} />
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
    <GroupContainer>
      <GroupHeader>
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
      </GroupHeader>
      <GroupBody>
        <Items groups={groups} state={items} />
      </GroupBody>
    </GroupContainer>
  );
};

export type SheetEditTemplateProps = {
  state: SheetState;
};

export const SheetEditTemplate: React.FC<SheetEditTemplateProps> = ({ state }) => {
  const dispatch = useAppDispatch();

  const groups = useMemo(() => groupItems(state), [state]);
  const groupKeys = [...new Set(["", ...state.groups.map((group) => group.key)])];

  return (
    <Container>
      {groups.map((group) =>
        group.groupId === "" ? (
          <Items groups={groupKeys} state={group.items} />
        ) : (
          <Group groups={groupKeys} state={group} />
        )
      )}
      <button onClick={() => dispatch(newItem({ sheetId: state.sheetId }))}>
        new item
      </button>
      <button onClick={() => dispatch(newGroup({ sheetId: state.sheetId, key: "" }))}>
        new group
      </button>
    </Container>
  );
};
