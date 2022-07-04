import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../state/hook";
import { selectSpaceId, updateItem } from "../../state/slice";
import styled from "styled-components";
import { GroupDisplay, Item } from "../../type/space";
import {
  groupItems,
  ItemEvaluated,
  SheetGroupedItems,
  SheetState,
} from "../../util/evalItems";
import { Display, Edit } from "./modes";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const GroupHeader = styled.div`
  font-size: larger;
  border-bottom: 1px solid black;
  margin-bottom: 1rem;
`;

type Reverse = { display: GroupDisplay };

const ItemsContainer = styled.div<Reverse>`
  display: flex;
  gap: 1rem;
  flex-direction: ${(props) => (props.display === "rows" ? "column" : "row")};
`;

type ItemEditProps = {
  state: ItemEvaluated<Item>;
};

const ItemValueEdit: React.FC<ItemEditProps> = ({ state }) => {
  const spaceId = useAppSelector(selectSpaceId);
  const dispatch = useAppDispatch();

  const [value, setValue] = useState(state.value);
  useEffect(() => {
    const t = setTimeout(() => {
      if (spaceId === null) return;
      dispatch(updateItem({ spaceId, itemId: state.itemId, value }));
    }, 500);

    return () => clearTimeout(t);
  }, [value, dispatch, state.itemId, spaceId]);

  return (
    <Edit state={state}>
      <>{state.valueEvaluated}</>
      <>
        <input value={value} onChange={(ev) => setValue(ev.target.value)} />
      </>
    </Edit>
  );
};

type ItemsProps = {
  display: SheetGroupedItems["display"];
  state: SheetGroupedItems["items"];
  edit: boolean;
};

const Items: React.FC<ItemsProps> = ({ display, state, edit }) => {
  const displayWithDefault = display ?? "rows";

  return (
    <ItemsContainer display={displayWithDefault}>
      {state.map((item) =>
        edit ? (
          <ItemValueEdit key={item.itemId} state={item} />
        ) : (
          <Display key={item.itemId} state={item}>
            {item.valueEvaluated}
          </Display>
        )
      )}
    </ItemsContainer>
  );
};

type GroupProps = {
  state: SheetGroupedItems;
  edit: boolean;
};

const Group: React.FC<GroupProps> = ({ state, edit }) => {
  return (
    <div>
      <GroupHeader>{state.name ?? ""}</GroupHeader>
      <Items display={state.display} state={state.items} edit={edit} />
    </div>
  );
};

export type SheetDisplayProps = {
  state: SheetState;
  edit: boolean;
};

export const SheetDisplay: React.FC<SheetDisplayProps> = ({ state, edit }) => {
  const groups = useMemo(() => groupItems(state), [state]);

  return (
    <Container>
      {groups.map((group) =>
        group.groupId === "" ? (
          <Items key="" display={group.display} state={group.items} edit={edit} />
        ) : (
          <Group key={group.groupId} state={group} edit={edit} />
        )
      )}
    </Container>
  );
};
